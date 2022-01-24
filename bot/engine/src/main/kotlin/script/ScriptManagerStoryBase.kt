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

package ai.tock.bot.DialogManager

import ai.tock.bot.ScriptManager.ScriptStep
import ai.tock.bot.ScriptManager.ScriptStep.*
import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.bot.admin.story.StoryDefinitionConfigurationDAO
import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.Intent.Companion.unknown
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.dialog.Story
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.bot.engine.dialogManager.handler.ScriptHandler
import ai.tock.bot.engine.nlp.BuiltInKeywordListener
import ai.tock.bot.engine.nlp.keywordServices
import ai.tock.bot.engine.user.UserTimelineDAO
import ai.tock.bot.script.Script
import ai.tock.bot.script.ScriptDefinition
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.story.dialogManager.SimpleStoryDefinition
import ai.tock.bot.story.dialogManager.handler.SimpleStoryHandlerBase
import ai.tock.bot.story.dialogManager.handler.StoryHandlerBase
import ai.tock.nlp.api.client.model.dump.IntentDefinition
import ai.tock.shared.*
import ai.tock.shared.vertx.vertx
import ai.tock.translator.I18nKeyProvider
import ai.tock.translator.I18nLabelValue
import com.github.salomonbrys.kodein.instance
import mu.KotlinLogging

class ScriptManagerStoryBase(
    override val stories: List<StoryDefinition>,
    override val unknownStory: StoryDefinition = defaultUnknownStory,
    override val helloStory: StoryDefinition? = null,
    override val goodbyeStory: StoryDefinition? = null,
    override val noInputStory: StoryDefinition? = null,
    override val disabledStory: StoryDefinition? = null,
    override val enabledStory: StoryDefinition? = null,
    override val userLocationStory: StoryDefinition? = null,
    override val handleAttachmentStory: StoryDefinition? = null,
    override val keywordStory: StoryDefinition = defaultKeywordStory,
) : ScriptManagerStory {

    private val executor: Executor get() = injector.provide()

    private val storyDAO: StoryDefinitionConfigurationDAO by injector.instance()

    private val storyDefinitionConfigurationDAO: StoryDefinitionConfigurationDAO get() = injector.provide()
    /**
     * List of deactivation stories.
     */
    override val disabledStories: List<StoryDefinition>
        get() = findStoryDefinitionByTag(StoryTag.DISABLE)

    /**
     * List of reactivation stories.
     */
    override val enabledStories: List<StoryDefinition>
        get() = findStoryDefinitionByTag(StoryTag.ENABLE)

    companion object {
        private val logger = KotlinLogging.logger {}

        /**
         * The default [unknownStory].
         */
        val defaultUnknownStory =
            SimpleStoryDefinition(
                "tock_unknown_story",
                object : SimpleStoryHandlerBase() {
                    override fun action(bus: BotBus) {
                        bus.markAsUnknown()
                        bus.end(bus.botDefinition.defaultUnknownAnswer)
                    }
                },
                setOf(unknown)
            )

        /**
         * Returns a (potential) keyword from the [BotBus].
         */
        fun getKeyword(bus: BotBus): String? {
            return if (bus.action is SendSentence) {
                (bus.action as SendSentence).stringText
            } else {
                null
            }
        }

        /**
         * The default handler used to handle test context initialization.
         */
        fun testContextKeywordHandler(bus: BotBus, sendEnd: Boolean = true) {
            bus.dialogManager.add(
                Dialog(
                    setOf(bus.userId, bus.botId)
                )
            )
            bus.botDefinition.testBehaviour.setup(bus)
            if (sendEnd) {
                bus.end(bus.baseI18nValue("test context activated (user state cleaned)"))
            }
        }

        /**
         * The default handler used to cleanup test context.
         */
        fun endTestContextKeywordHandler(bus: BotBus, sendEnd: Boolean = true) {
            bus.dialogManager.add(
                Dialog(
                    setOf(bus.userId, bus.botId)
                )
            )
            bus.botDefinition.testBehaviour.cleanup(bus)
            if (sendEnd) {
                bus.end(bus.baseI18nValue("test context disabled"))
            }
        }

        /**
         * The default handler used to delete the current user.
         */
        fun deleteKeywordHandler(bus: BotBus, sendEnd: Boolean = true) {
            bus.handleDelete()
            if (sendEnd) {
                bus.end(
                    bus.baseI18nValue(
                        "user removed - {0} {1}",
                        bus.dialogManager.userPreferences.firstName,
                        bus.dialogManager.userPreferences.lastName
                    )
                )
            }
        }

        private fun BotBus.baseI18nValue(
            defaultLabel: String,
            vararg args: Any?
        ): I18nLabelValue = i18nValue(botDefinition.namespace, defaultLabel, *args)

        private fun i18nValue(
            namespace: String,
            defaultLabel: String,
            vararg args: Any?
        ): I18nLabelValue =
            I18nLabelValue(
                I18nKeyProvider.generateKey(namespace, "keywords", defaultLabel),
                namespace,
                "keywords",
                defaultLabel,
                args.toList()
            )

        private fun BotBus.handleDelete() {
            val userTimelineDao: UserTimelineDAO by injector.instance()
            // run later to avoid the lock effect :)
            vertx.setTimer(1000) {
                vertx.executeBlocking<Unit>(
                    {
                        try {
                            userTimelineDao.remove(botDefinition.namespace, userId)
                        } catch (e: Exception) {
                            logger.error(e)
                        } finally {
                            it.complete()
                        }
                    },
                    false, {}
                )
            }
        }

        /**
         * The default [keywordStory].
         */
        val defaultKeywordStory =
            SimpleStoryDefinition(
                "tock_keyword_story",
                object : SimpleStoryHandlerBase() {
                    override fun action(bus: BotBus) {
                        val text = getKeyword(bus)
                        if (!handleWithKeywordListeners(bus, text)) {
                            when (text) {
                                BuiltInKeywordListener.deleteKeyword -> deleteKeywordHandler(bus)
                                BuiltInKeywordListener.testContextKeyword -> testContextKeywordHandler(bus)
                                BuiltInKeywordListener.endTestContextKeyword -> endTestContextKeywordHandler(bus)
                                else -> bus.end(bus.baseI18nValue("unknown keyword : {0}", text))
                            }
                        }
                    }
                },
                setOf(Intent.keyword)
            )

        fun handleWithKeywordListeners(bus: BotBus, keyword: String?): Boolean {
            if (keyword != null) {
                keywordServices.asSequence().map { it.keywordHandler(keyword) }.firstOrNull()?.let { handler ->
                    handler(bus)
                    return true
                }
            }
            return false
        }
    }

    override fun findIntent(intent: String, applicationId: String): Intent =
        ScriptManagerStory.findIntent(stories, intent)

    override fun findMainIntent(scriptStep: ScriptStep): IntentAware? {
        return when(scriptStep) {
            START_SCRIPT -> helloStory?.mainIntent()
            END_SCRIPT -> goodbyeStory?.mainIntent()
            DEFAULT -> defaultStory.mainIntent()
        }
    }

    override fun getHandleAttachmentIntent() : IntentAware? = handleAttachmentStory?.mainIntent()

    override fun getUserLocationIntent() : IntentAware? = userLocationStory?.mainIntent()

    override fun getFrontUnkowIntents(frontIntents: List<IntentDefinition>): List<IntentAware> {
        return stories
            .filter { !it.mainIntent().wrap(unknown) }
            .filter {
                !frontIntents
                    .map { it.name.withoutNamespace() }
                    .contains(it.mainIntent().name().withoutNamespace())
            }

    }

    override fun initNameSpace(namespace: String): Unit {
        (
           stories +
                listOfNotNull(
                    unknownStory,
                    helloStory,
                    goodbyeStory,
                    noInputStory,
                    disabledStory,
                    enabledStory,
                    userLocationStory,
                    handleAttachmentStory,
                    keywordStory
                )
        ).forEach {
            (it.scriptHandler as? StoryHandlerBase<*>)?.apply {
                i18nNamespace = namespace
            }
        }
    }

    /**
     * Search story by storyId.
     */
    override fun findScriptDefinitionById(storyId: String, applicationId: String): ScriptDefinition {
        return stories.find { it.id == storyId } ?: unknownStory
    }

    /**
     * Finds a [StoryDefinition] from an [Intent].
     */
    override fun findStoryDefinition(intent: IntentAware?, applicationId: String): StoryDefinition {
        return if (intent is StoryDefinition) {
            intent
        } else {
            findStoryDefinition(intent?.name(), applicationId)
        }
    }

    /**
     * Search story by storyHandler.
     */
    override fun findStoryByStoryHandler(storyHandler: ScriptHandler, applicationId: String): StoryDefinition? {
        return stories.find { it.scriptHandler == storyHandler }
    }

    /**
     * Finds a [StoryDefinition] from an intent name.
     *
     * @param intent the intent name
     * @param applicationId the optional applicationId
     */
    override fun findStoryDefinition(intent: String?, applicationId: String): StoryDefinition {
        return ScriptManagerStory.findStoryDefinition(stories, intent, unknownStory, keywordStory)
    }

    private fun findStoryDefinitionByTag(tag: StoryTag): List<StoryDefinition> {
        return stories.filter { it.tags.contains(tag) }
    }

    override fun findEnableEndScriptId(namespace: String, botId: String, applicationId: String, scriptDefinitionId: String): String? {
        //Check if there is a configuration for Ending story
        val storySetting = storyDAO.getStoryDefinitionsByNamespaceBotIdStoryId(
            namespace,
            botId,
            scriptDefinitionId
        )
        return storySetting?.findEnabledEndWithStoryId(applicationId)
    }

    override fun isDisabledIntent(intent: IntentAware?): Boolean {
        return intent?.let {
                intent ->
                    disabledStories.any { it.isStarterIntent(intent) }
                       || disabledStory?.isStarterIntent(intent) ?: false
        } ?: false
    }

    override fun isEnabledIntent(intent: IntentAware?): Boolean {
        return intent?.let {
                intent ->
                    enabledStories.any { it.isStarterIntent(intent) }
                        || enabledStory?.isStarterIntent(intent) ?: false
        } ?: false
    }

    override fun createScript(intent: IntentAware?, applicationId: String): Script {
        val storyDefinition: StoryDefinition = findStoryDefinition(intent, applicationId)
        return Story(
            storyDefinition,
            if (intent != null && storyDefinition.isStarterIntent(intent)) {
                intent.wrappedIntent()
            } else {
                storyDefinition.mainIntent().wrappedIntent()
            }
        )
    }

    override fun mapScriptByIntent(): MutableMap<String, MutableList<ScriptDefinition>> {
        val starterIntentsMap: MutableMap<String, MutableList<ScriptDefinition>> = mutableMapOf()
        stories.map { s: StoryDefinition ->
            s.starterIntents.forEach {
                val l = starterIntentsMap.getOrPut(it.name()) { mutableListOf() }
                l.add(s)
            }
        }
        return starterIntentsMap
    }

    override fun createBuiltInScriptsIfNotExist(botDefinition: BotDefinition, configurationName: String?) {
        storyDefinitionConfigurationDAO.createBuiltInStoriesIfNotExist(
            stories.filter { it.mainIntent() != Intent.unknown }
                .map { storyDefinition ->
                    StoryDefinitionConfiguration(botDefinition, storyDefinition, configurationName)
                }
        )
    }
}