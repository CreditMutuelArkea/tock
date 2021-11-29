/*
 * Copyright (C) 2017/2021 e-voyageurs technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package ai.tock.bot.mongo

import ai.tock.bot.admin.dialog.DialogReport
import ai.tock.bot.admin.dialog.DialogReportDAO
import ai.tock.bot.admin.dialog.DialogReportQuery
import ai.tock.bot.admin.dialog.DialogReportQueryResult
import ai.tock.bot.admin.user.AnalyticsQuery
import ai.tock.bot.admin.user.UserAnalytics
import ai.tock.bot.admin.user.UserReportDAO
import ai.tock.bot.admin.user.UserReportQuery
import ai.tock.bot.admin.user.UserReportQueryResult
import ai.tock.bot.connector.ConnectorMessage
import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.engine.dialogManager.story.StoryDefinition
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.dialog.ArchivedEntityValue
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.dialog.EntityStateValue
import ai.tock.bot.engine.dialog.Snapshot
import ai.tock.bot.engine.nlp.NlpCallStats
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.engine.user.PlayerType
import ai.tock.bot.engine.user.UserTimeline
import ai.tock.bot.engine.user.UserTimelineDAO
import ai.tock.bot.mongo.BotApplicationConfigurationMongoDAO.getApplicationIds
import ai.tock.bot.mongo.ClientIdCol_.Companion.UserIds
import ai.tock.bot.mongo.DialogCol_.Companion.GroupId
import ai.tock.bot.mongo.DialogCol_.Companion.PlayerIds
import ai.tock.bot.mongo.DialogCol_.Companion.Stories
import ai.tock.bot.mongo.DialogCol_.Companion._id
import ai.tock.bot.mongo.DialogTextCol_.Companion.Date
import ai.tock.bot.mongo.DialogTextCol_.Companion.DialogId
import ai.tock.bot.mongo.DialogTextCol_.Companion.Text
import ai.tock.bot.mongo.MongoBotConfiguration.database
import ai.tock.bot.mongo.NlpStatsCol_.Companion.AppNamespace
import ai.tock.bot.mongo.UserTimelineCol_.Companion.ApplicationIds
import ai.tock.bot.mongo.UserTimelineCol_.Companion.LastUpdateDate
import ai.tock.bot.mongo.UserTimelineCol_.Companion.LastUserActionDate
import ai.tock.bot.mongo.UserTimelineCol_.Companion.Namespace
import ai.tock.bot.mongo.UserTimelineCol_.Companion.PlayerId
import ai.tock.bot.mongo.UserTimelineCol_.Companion.TemporaryIds
import ai.tock.shared.Executor
import ai.tock.shared.booleanProperty
import ai.tock.shared.ensureIndex
import ai.tock.shared.ensureUniqueIndex
import ai.tock.shared.error
import ai.tock.shared.injector
import ai.tock.shared.intProperty
import ai.tock.shared.jackson.AnyValueWrapper
import ai.tock.shared.longProperty
import com.github.salomonbrys.kodein.instance
import com.mongodb.ReadPreference.secondaryPreferred
import com.mongodb.client.model.IndexOptions
import com.mongodb.client.model.ReplaceOptions
import mu.KotlinLogging
import org.litote.kmongo.Id
import org.litote.kmongo.MongoOperator.and
import org.litote.kmongo.MongoOperator.gt
import org.litote.kmongo.MongoOperator.or
import org.litote.kmongo.MongoOperator.type
import org.litote.kmongo.`in`
import org.litote.kmongo.addEachToSet
import org.litote.kmongo.addToSet
import org.litote.kmongo.aggregate
import org.litote.kmongo.and
import org.litote.kmongo.ascendingSort
import org.litote.kmongo.bson
import org.litote.kmongo.contains
import org.litote.kmongo.deleteOneById
import org.litote.kmongo.descending
import org.litote.kmongo.descendingSort
import org.litote.kmongo.eq
import org.litote.kmongo.find
import org.litote.kmongo.findOne
import org.litote.kmongo.findOneById
import org.litote.kmongo.getCollection
import org.litote.kmongo.gt
import org.litote.kmongo.json
import org.litote.kmongo.limit
import org.litote.kmongo.lt
import org.litote.kmongo.match
import org.litote.kmongo.orderBy
import org.litote.kmongo.pull
import org.litote.kmongo.regex
import org.litote.kmongo.replaceOneWithFilter
import org.litote.kmongo.save
import org.litote.kmongo.setValue
import org.litote.kmongo.sort
import org.litote.kmongo.toId
import org.litote.kmongo.updateOneById
import org.litote.kmongo.upsert
import java.time.Instant
import java.time.Instant.now
import java.time.ZoneOffset
import java.util.concurrent.TimeUnit.DAYS

/**
 *
 */
internal object UserTimelineMongoDAO : UserTimelineDAO, UserReportDAO, DialogReportDAO {

    private val addNamespaceToTimelineId: Boolean = booleanProperty("tock_bot_add_namespace_to_timeline_id", false)
    private val maxActionsByDialog = intProperty("tock_bot_max_actions_by_dialog", 1000)
    private val dialogFlowStatEnabled = booleanProperty("tock_bot_dialog_flow_stat", true)
    private val dialogMaxValidityInSeconds = longProperty("tock_bot_dialog_max_validity_in_seconds", 60 * 60 * 24)

    // wrapper to workaround the 1024 chars limit for String indexes
    private fun textKey(text: String): String =
        if (text.length > 512) text.substring(0, Math.min(512, text.length)) else text

    private val logger = KotlinLogging.logger {}

    private val executor: Executor by injector.instance()

    val userTimelineCol = database.getCollection<UserTimelineCol>("user_timeline")
    val dialogCol = database.getCollection<DialogCol>("dialog")
    private val dialogTextCol = database.getCollection<DialogTextCol>("dialog_text")
    private val clientIdCol = database.getCollection<ClientIdCol>("client_id")
    private val connectorMessageCol = database.getCollection<ConnectorMessageCol>("connector_message")
    private val nlpStatsCol = database.getCollection<NlpStatsCol>("action_nlp_stats")
    private val snapshotCol = database.getCollection<SnapshotCol>("dialog_snapshot")
    private val archivedEntityValuesCol = database.getCollection<ArchivedEntityValuesCol>("archived_entity_values")

    init {
        try {
            val ttlIndexOptions = IndexOptions().expireAfter(longProperty("tock_bot_dialog_index_ttl_days", 7), DAYS)

            if (addNamespaceToTimelineId) {
                userTimelineCol.ensureUniqueIndex(PlayerId.id, Namespace)
            } else {
                userTimelineCol.ensureUniqueIndex(PlayerId.id)
            }

            userTimelineCol.ensureIndex(TemporaryIds)
            userTimelineCol.ensureIndex(
                LastUpdateDate,
                indexOptions = IndexOptions()
                    .expireAfter(longProperty("tock_bot_timeline_index_ttl_days", 365), DAYS)
            )
            dialogCol.ensureIndex(PlayerIds.id)
            dialogCol.ensureIndex(PlayerIds.id, Namespace)
            dialogCol.ensureIndex(PlayerIds.clientId)
            dialogCol.ensureIndex(
                DialogCol_.LastUpdateDate,
                indexOptions = ttlIndexOptions
            )
            dialogCol.ensureIndex(
                orderBy(
                    mapOf(
                        PlayerIds.id to true,
                        LastUpdateDate to false
                    )
                )
            )
            dialogCol.ensureIndex(GroupId)

            dialogTextCol.ensureIndex(Text)
            dialogTextCol.ensureIndex(Text)
            dialogTextCol.ensureUniqueIndex(Text, DialogId)
            dialogTextCol.ensureIndex(
                Date,
                indexOptions = ttlIndexOptions
            )
            connectorMessageCol.ensureIndex(
                "{date:1}",
                ttlIndexOptions
            )
            connectorMessageCol.ensureIndex("{'_id.dialogId':1}")
            nlpStatsCol.ensureIndex(
                Date,
                indexOptions = ttlIndexOptions
            )
            nlpStatsCol.ensureIndex(NlpStatsCol_._id.actionId, AppNamespace)
            snapshotCol.ensureIndex(
                SnapshotCol_.LastUpdateDate,
                indexOptions = ttlIndexOptions
            )
            archivedEntityValuesCol.ensureIndex(
                ArchivedEntityValuesCol_.LastUpdateDate,
                indexOptions = ttlIndexOptions
            )
        } catch (e: Exception) {
            logger.error(e)
        }
    }

    override fun save(userTimeline: UserTimeline, namespace: String) {
        save(userTimeline, namespace, null)
    }

    override fun save(userTimeline: UserTimeline, botDefinition: BotDefinition) {
        save(userTimeline, botDefinition.namespace, botDefinition)
    }

    private fun timelineId(userId: String, namespace: String): String =
        if (addNamespaceToTimelineId) "_${namespace}_$userId" else userId

    private fun save(userTimeline: UserTimeline, namespace: String, botDefinition: BotDefinition?) {
        logger.debug { "start to save timeline $userTimeline" }
        val timelineId = timelineId(userTimeline.playerId.id, namespace)
        val oldTimeline = userTimelineCol.findOneById(timelineId)
        logger.debug { "load old timeline $userTimeline" }
        val newTimeline = UserTimelineCol(timelineId, namespace, userTimeline, oldTimeline)
        logger.debug { "create new timeline $newTimeline" }
        userTimelineCol.save(newTimeline)
        logger.debug { "timeline saved $userTimeline" }
        // create a new dialog if actions number limit reached
        val lastDialog = userTimeline.currentDialog
        if (lastDialog != null && lastDialog.actionsSize > maxActionsByDialog) {
            userTimeline.dialogs.add(Dialog.initFromDialog(lastDialog))
        }
        for (dialog in userTimeline.dialogs) {
            val dialogToSave = DialogCol(dialog, newTimeline)
            logger.debug { "dialog to save created $userTimeline" }
            try {
                dialogCol.save(dialogToSave)
            } catch (e: Exception) {
                logger.error(e)
                logger.error("Dialog save failure: $dialogToSave")
            }
            logger.debug { "dialog saved $userTimeline" }
        }

        executor.executeBlocking {
            if (userTimeline.playerId.clientId != null) {
                clientIdCol.updateOneById(
                    userTimeline.playerId.clientId!!,
                    addEachToSet(
                        UserIds,
                        listOf(userTimeline.playerId.id)
                    ),
                    upsert()
                )
            }
            var lastSnapshot: SnapshotCol? = null
            for (dialog in userTimeline.dialogs) {
                lastSnapshot = addSnapshot(dialog)
                addArchivedValues(dialog)

                dialog.allActions().forEach {
                    when (it) {
                        is SendSentenceNotYetLoaded -> {
                            if (it.messageLoaded && it.messages.isNotEmpty()) {
                                saveConnectorMessage(it.toActionId(), dialog.id, it.messages)
                            }
                            if (it.nlpStatsLoaded && it.nlpStats != null) {
                                saveNlpStats(it.toActionId(), dialog.id, it.nlpStats!!)
                            }
                        }
                        is SendSentence -> {
                            if (it.messages.isNotEmpty()) {
                                saveConnectorMessage(it.toActionId(), dialog.id, it.messages)
                            }
                            if (it.nlpStats != null) {
                                saveNlpStats(it.toActionId(), dialog.id, it.nlpStats!!)
                            }
                        }
                        else -> {
                            /*do nothing*/
                        }
                    }
                }
            }
            val lastUserAction = lastDialog?.allActions()?.lastOrNull { it.playerId.type == PlayerType.user }
            lastUserAction?.let { action ->
                if (action is SendSentence && action.stringText != null) {
                    val text = textKey(action.stringText!!)
                    dialogTextCol.replaceOneWithFilter(
                        and(Text eq text, DialogId eq lastDialog.id),
                        DialogTextCol(text, lastDialog.id),
                        ReplaceOptions().upsert(true)
                    )
                }
            }
            if (dialogFlowStatEnabled && botDefinition != null && lastDialog != null && lastSnapshot != null && lastUserAction != null) {
                DialogFlowMongoDAO.addFlowStat(botDefinition, lastUserAction, lastDialog, lastSnapshot)
            }
        }
        logger.debug { "end saving timeline $userTimeline" }
    }

    override fun updatePlayerId(namespace: String, oldPlayerId: PlayerId, newPlayerId: PlayerId) {
        val timelineId = timelineId(oldPlayerId.id, namespace)
        userTimelineCol.updateOneById(timelineId, setValue(PlayerId, newPlayerId))
        dialogCol.updateMany(
            and(
                Namespace eq namespace,
                PlayerIds contains oldPlayerId
            ),
            addToSet(PlayerIds, newPlayerId)
        )
        dialogCol.updateMany(
            and(
                Namespace eq namespace,
                PlayerIds contains newPlayerId
            ),
            pull(PlayerIds, oldPlayerId)
        )
        if (newPlayerId.clientId != null) {
            clientIdCol.updateOneById(
                newPlayerId.clientId!!,
                addToSet(
                    UserIds,
                    newPlayerId.id
                ),
                upsert()
            )
        }
    }

    private fun saveConnectorMessage(actionId: Id<Action>, dialogId: Id<Dialog>, messages: List<ConnectorMessage>) {
        connectorMessageCol.save(
            ConnectorMessageCol(
                ConnectorMessageColId(actionId, dialogId),
                messages.map { AnyValueWrapper(it) }
            )
        )
    }

    internal fun loadConnectorMessage(actionId: Id<Action>, dialogId: Id<Dialog>): List<ConnectorMessage> {
        return try {
            connectorMessageCol.findOneById(ConnectorMessageColId(actionId, dialogId))
                ?.messages
                ?.mapNotNull { it?.value as? ConnectorMessage }
                ?: emptyList()
        } catch (e: Exception) {
            logger.error(e)
            emptyList()
        }
    }

    internal fun loadConnectorMessages(ids: List<ConnectorMessageColId>): Map<ConnectorMessageColId, List<ConnectorMessage>> {
        return try {
            if (ids.isEmpty()) {
                emptyMap()
            } else {
                connectorMessageCol.find(ConnectorMessageCol::_id `in` ids)
                    .map { m -> m._id to m.messages.mapNotNull { it?.value as? ConnectorMessage } }
                    .toMap()
            }
        } catch (e: Exception) {
            logger.error(e)
            emptyMap()
        }
    }

    private fun saveNlpStats(actionId: Id<Action>, dialogId: Id<Dialog>, nlpCallStats: NlpCallStats) {
        nlpStatsCol.save(
            NlpStatsCol(
                NlpStatsColId(actionId, dialogId),
                nlpCallStats,
                nlpCallStats.nlpQuery.namespace
            )
        )
    }

    internal fun loadNlpStats(actionId: Id<Action>, dialogId: Id<Dialog>): NlpCallStats? {
        return try {
            nlpStatsCol.findOneById(NlpStatsColId(actionId, dialogId))?.stats
        } catch (e: Exception) {
            logger.error(e)
            null
        }
    }

    override fun getNlpCallStats(actionId: Id<Action>, namespace: String): NlpCallStats? {
        return try {
            nlpStatsCol.findOne(NlpStatsCol_._id.actionId eq actionId, AppNamespace eq namespace)?.stats
        } catch (e: Exception) {
            logger.error(e)
            null
        }
    }

    override fun loadWithLastValidDialog(
        namespace: String,
        userId: PlayerId,
        priorUserId: PlayerId?,
        groupId: String?,
        storyDefinitionProvider: (String) -> StoryDefinition
    ): UserTimeline {
        val timeline = loadWithoutDialogs(namespace, userId)

        loadLastValidDialog(namespace, userId, groupId, storyDefinitionProvider)?.apply { timeline.dialogs.add(this) }

        if (priorUserId != null) {
            // link timeline
            timeline.temporaryIds.add(priorUserId.id)

            // copy state
            val priorTimelineId = timelineId(priorUserId.id, namespace)
            userTimelineCol.findOneById(priorTimelineId)
                ?.apply {
                    toUserTimeline().userState.flags.forEach {
                        timeline.userState.flags.putIfAbsent(it.key, it.value)
                    }
                }

            // copy dialog
            loadLastValidDialog(namespace, priorUserId, groupId, storyDefinitionProvider)
                ?.apply {
                    timeline.dialogs.add(
                        copy(
                            playerIds + userId
                        )
                    )
                }
        }

        logger.trace { "timeline for user $userId : $timeline" }
        return timeline
    }

    override fun remove(namespace: String, playerId: PlayerId) {
        dialogCol.deleteMany(and(PlayerIds.id eq playerId.id, Namespace eq namespace))
        userTimelineCol.deleteOne(and(PlayerId.id eq playerId.id, Namespace eq namespace))
        MongoUserLock.deleteLock(playerId.id)
    }

    override fun removeClient(namespace: String, clientId: String) {
        clientIdCol.findOneById(clientId)?.userIds?.forEach { remove(namespace, PlayerId(it)) }
        clientIdCol.deleteOneById(clientId)
    }

    override fun loadWithoutDialogs(namespace: String, userId: PlayerId): UserTimeline {
        val timelineId = timelineId(userId.id, namespace)
        val timeline = userTimelineCol.findOneById(timelineId)?.copy(playerId = userId)
        return if (timeline == null) {
            logger.debug { "no timeline for user $userId" }
            UserTimeline(userId)
        } else {
            timeline.toUserTimeline()
        }
    }

    override fun loadByTemporaryIdsWithoutDialogs(namespace: String, temporaryIds: List<String>): List<UserTimeline> {
        return userTimelineCol.find(TemporaryIds `in` (temporaryIds), Namespace eq namespace)
            .map { it.toUserTimeline() }.toList()
    }

    private fun loadLastValidGroupDialogCol(namespace: String, groupId: String): DialogCol? {
        return dialogCol.aggregate<DialogCol>(
            match(
                Namespace eq namespace,
                GroupId eq groupId,
                LastUpdateDate gt now().minusSeconds(dialogMaxValidityInSeconds)
            ),
            sort(
                descending(LastUpdateDate)
            ),
            limit(1)
        ).firstOrNull()
    }

    private fun loadLastValidDialogCol(namespace: String, userId: PlayerId): DialogCol? {
        return dialogCol.aggregate<DialogCol>(
            match(
                PlayerIds.id eq userId.id,
                Namespace eq namespace,
                LastUpdateDate gt now().minusSeconds(dialogMaxValidityInSeconds)
            ),
            sort(
                descending(LastUpdateDate)
            ),
            limit(1)
        ).firstOrNull()
    }

    private fun loadLastValidDialog(
        namespace: String,
        userId: PlayerId,
        groupId: String? = null,
        storyDefinitionProvider: (String) -> StoryDefinition
    ): Dialog? {
        return try {
            (groupId?.let { loadLastValidGroupDialogCol(namespace, it) } ?: loadLastValidDialogCol(namespace, userId))
                ?.toDialog(storyDefinitionProvider)
        } catch (e: Exception) {
            logger.error(e)
            null
        }
    }

    override fun search(query: UserReportQuery): UserReportQueryResult {
        with(query) {
            val applicationsIds = getApplicationIds(query.namespace, query.nlpModel)
            if (applicationsIds.isEmpty()) {
                return UserReportQueryResult(0)
            }
            val filter =
                and(
                    ApplicationIds `in` applicationsIds.filter { it.isNotEmpty() },
                    Namespace eq query.namespace,
                    if (name.isNullOrBlank()) null
                    else UserTimelineCol_.UserPreferences.lastName.regex(name!!.trim(), "i"),
                    if (from == null) null else LastUpdateDate gt from?.toInstant(),
                    if (to == null) null else LastUpdateDate lt to?.toInstant(),
                    if (flags.isEmpty()) null
                    else flags.flatMap {
                        "userState.flags.${it.key}".let { key ->
                            listOfNotNull(
                                if (it.value == null) null else "{'$key.value':${it.value!!.json}}",
                                "{$or:[{'$key.expirationDate':{$gt:${now().json}}},{'$key.expirationDate':{$type:10}}]}"
                            )
                        }
                    }.joinToString(",", "{$and:[", "]}").bson,
                    if (query.displayTests) null else UserTimelineCol_.UserPreferences.test eq false
                )
            logger.debug { "user search query: $filter" }
            val c = userTimelineCol.withReadPreference(secondaryPreferred())
            val count = c.countDocuments(filter)
            return if (count > start) {
                val list = c.find(filter)
                    .skip(start.toInt()).limit(size).descendingSort(LastUpdateDate).map { it.toUserReport() }.toList()
                UserReportQueryResult(count, start, start + list.size, list)
            } else {
                UserReportQueryResult(0, 0, 0, emptyList())
            }
        }
    }

    override fun search(query: AnalyticsQuery): List<UserAnalytics> {
        with(query) {
            val applicationsIds = getApplicationIds(query.namespace, query.nlpModel)
            if (applicationsIds.isEmpty()) {
                return emptyList()
            }
            val filter =
                and(
                    ApplicationIds `in` applicationsIds.filter { it.isNotEmpty() },
                    Namespace eq query.namespace,
                    LastUpdateDate gt from.toInstant(ZoneOffset.UTC),
                    LastUpdateDate lt to.toInstant(ZoneOffset.UTC)
                )
            logger.debug { "user analytics search query: $filter" }
            val c = userTimelineCol.withReadPreference(secondaryPreferred())
            return c.find(filter).ascendingSort(LastUserActionDate)
                .map { it.toUserAnalytics() }.toList()
        }
    }

    override fun search(query: DialogReportQuery): DialogReportQueryResult {
        with(query) {
            val applicationsIds = getApplicationIds(query.namespace, query.nlpModel)
            if (applicationsIds.isEmpty()) {
                return DialogReportQueryResult(0)
            }
            val dialogIds = if (query.text.isNullOrBlank()) {
                emptySet()
            } else {
                if (query.exactMatch) {
                    dialogTextCol.find(Text eq textKey(query.text!!.trim())).map { it.dialogId }.toSet()
                } else {
                    dialogTextCol
                        .find(Text.regex(textKey(query.text!!.trim()), "i"))
                        .map { it.dialogId }
                        .toSet()
                }
            }
            if (dialogIds.isEmpty() && !query.text.isNullOrBlank()) {
                return DialogReportQueryResult(0, 0, 0, emptyList())
            }
            val filter = and(
                DialogCol_.ApplicationIds `in` applicationsIds.filter { it.isNotEmpty() },
                Namespace eq query.namespace,
                if (query.playerId != null || query.displayTests) null else DialogCol_.Test eq false,
                if (query.playerId == null) null else PlayerIds.id eq query.playerId!!.id,
                if (query.dialogId == null) null else _id eq query.dialogId!!.toId(),
                if (dialogIds.isEmpty()) null else _id `in` dialogIds,
                if (from == null) null else DialogCol_.LastUpdateDate gt from?.toInstant(),
                if (to == null) null else DialogCol_.LastUpdateDate lt to?.toInstant(),
                if (connectorType == null) null else Stories.actions.state.targetConnectorType.id eq connectorType!!.id,
                if (query.intentName.isNullOrBlank()) null else Stories.currentIntent.name_ eq query.intentName
            )
            logger.debug("dialog search query: $filter")
            val c = dialogCol.withReadPreference(secondaryPreferred())
            val count = c.countDocuments(filter)
            return if (count > start) {
                val list = c.find(filter)
                    .skip(start.toInt())
                    .limit(size)
                    .descendingSort(LastUpdateDate)
                    .run {
                        map { it.toDialogReport() }
                            .toList()
                    }
                DialogReportQueryResult(count, start, start + list.size, list)
            } else {
                DialogReportQueryResult(0, 0, 0, emptyList())
            }
        }
    }

    override fun getDialog(id: Id<Dialog>): DialogReport? {
        return dialogCol.findOneById(id)?.toDialogReport()
    }

    override fun getClientDialogs(
        namespace: String,
        clientId: String,
        storyDefinitionProvider: (String) -> StoryDefinition
    ): List<Dialog> {
        val ids = clientIdCol.findOneById(clientId)?.userIds ?: emptySet()
        return if (ids.isEmpty()) {
            emptyList()
        } else {
            dialogCol
                .find(PlayerIds.id `in` ids, Namespace eq namespace)
                .descendingSort(LastUpdateDate)
                .map { it.toDialog(storyDefinitionProvider) }
                .toList()
        }
    }

    override fun getDialogsUpdatedFrom(
        namespace: String,
        from: Instant,
        storyDefinitionProvider: (String) -> StoryDefinition
    ): List<Dialog> {
        return dialogCol
            .find(and(LastUpdateDate gt from, Namespace eq namespace))
            .map { it.toDialog(storyDefinitionProvider) }
            .toList()
    }

    private fun addSnapshot(dialog: Dialog): SnapshotCol {
        val snapshot = Snapshot(dialog)
        val existingSnapshot = snapshotCol.findOneById(dialog.id)
        return if (existingSnapshot == null) {
            SnapshotCol(dialog.id, listOf(snapshot))
                .also { snapshotCol.insertOne(it) }
        } else {
            existingSnapshot.copy(
                snapshots = existingSnapshot.snapshots + snapshot,
                lastUpdateDate = now()
            ).also { snapshotCol.save(it) }
        }
    }

    private fun addArchivedValues(dialog: Dialog) {
        dialog.state.entityValues.values.filter { it.hasBeanUpdatedInBus }
            .forEach {
                logger.debug { "save archived values for $it" }
                archivedEntityValuesCol.save(ArchivedEntityValuesCol(it.previousValues, it.stateValueId))
            }
    }

    override fun getSnapshots(dialogId: Id<Dialog>): List<Snapshot> {
        return try {
            snapshotCol.findOneById(dialogId)?.snapshots ?: emptyList()
        } catch (e: Exception) {
            logger.error(e)
            emptyList()
        }
    }

    override fun getLastStoryId(namespace: String, playerId: PlayerId): String? {
        return try {
            loadLastValidDialogCol(namespace, playerId)?.stories?.lastOrNull()?.storyDefinitionId
        } catch (e: Exception) {
            logger.error(e)
            null
        }
    }

    override fun getArchivedEntityValues(
        stateValueId: Id<EntityStateValue>,
        oldActionsMap: Map<Id<Action>, Action>
    ): List<ArchivedEntityValue> {
        logger.debug { "load archived values for $stateValueId" }
        return try {
            archivedEntityValuesCol.findOneById(stateValueId)
                ?.values?.map { it.toArchivedEntityValue(oldActionsMap) }
                ?: emptyList()
        } catch (e: Exception) {
            logger.error(e)
            emptyList()
        }
    }
}
