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

package ai.tock.bot.definition

import ai.tock.bot.DialogManager.ScriptManager
import ai.tock.bot.connector.ConnectorType
import ai.tock.bot.engine.I18nTranslator
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.SendChoice
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.engine.user.UserTimeline
import ai.tock.nlp.api.client.model.Entity
import ai.tock.nlp.api.client.model.EntityType
import ai.tock.shared.booleanProperty
import ai.tock.shared.property
import ai.tock.shared.withNamespace
import ai.tock.shared.withoutNamespace
import ai.tock.translator.I18nKeyProvider
import ai.tock.translator.I18nLabelValue
import ai.tock.translator.UserInterfaceType
import java.util.Locale

/**
 * The main interface used to define the behaviour of the bot.
 *
 * New bots should usually not directly extend this class, but instead extend [BotDefinitionBase].
 */
interface BotDefinition : I18nKeyProvider {

    /**
     * The main bot id. Must be different for each bot.
     */
    val botId: String

    /**
     * The namespace of the bot. It has to be the same namespace than the NLP models.
     */
    val namespace: String

    /**
     * The name of the main nlp model.
     */
    val nlpModelName: String

    /**
     * Manager of script of dialog. Can be a static story script, or a dynamic state graphe script, or other.
     */
    val scriptManager: ScriptManager

    /**
     * The default unknown answer.
     */
    val defaultUnknownAnswer: I18nLabelValue

    /**
     * To handle custom events.
     */
    val eventListener: EventListener

    /**
     *  Listener invoked when bot is enabled.
     */
    val botEnabledListener: (Action) -> Unit
        get() = {}

    val flowDefinition: DialogFlowDefinition?
        get() = null

    companion object {

        /**
         * Convenient default value in ms to wait before next answer sentence. 1s by default.
         */
        @Volatile
        var defaultBreath: Long = 1000L

        private val sendChoiceActivateBot = booleanProperty("tock_bot_send_choice_activate", true)

    }

    /**
     * Finds an [Intent] from an intent name.
     */
    fun findIntent(intent: String, applicationId: String): Intent {
        return scriptManager.findIntent(intent, applicationId)
    }


    /**
     * Called when error occurs. By default send "technical error".
     */
    fun errorAction(playerId: PlayerId, applicationId: String, recipientId: PlayerId): Action {
        return SendSentence(
            playerId,
            applicationId,
            recipientId,
            property("tock_technical_error", "Technical error :( sorry!")
        )
    }
/*
    /**
     * Does this action trigger bot deactivation ?
     */
    fun disableBot(timeline: UserTimeline, dialog: Dialog, action: Action): Boolean =
        action.state.notification
                || dialog.state.currentIntent?.let { botDisabledStory?.isStarterIntent(it) } ?: false
                || hasDisableTagIntent(dialog)

    /**
     * Returns true if the dialog current intent is a disabling intent.
     */
    fun hasDisableTagIntent(dialog: Dialog) =
        dialog.state.currentIntent?.let { botDisabledStories.any { story -> story.isStarterIntent(it) } } ?: false


    /**
     * Does this action trigger bot activation ?
     */
    fun enableBot(timeline: UserTimeline, dialog: Dialog, action: Action): Boolean =
        dialog.state.currentIntent?.let { botEnabledStory?.isStarterIntent(it) } ?: false
                || dialog.state.currentIntent?.let { botEnabledStories.any { story -> story.isStarterIntent(it) } } ?: false
                || ( // send choice can reactivate disabled bot (is the intent is not a disabled intent)
                    sendChoiceActivateBot &&
                        action is SendChoice &&
                        !action.state.notification &&
                        !(dialog.state.currentIntent?.let { botDisabledStory?.isStarterIntent(it) } ?: false)
                )

    */

    /**
     * If this method returns true, the action will be added in the stored history.
     *
     * By default, actions where the bot is not only [ai.tock.bot.engine.dialog.EventState.notification]
     * are added in the bot history.
     */
    fun hasToPersistAction(timeline: UserTimeline, action: Action): Boolean = !action.state.notification

    /**
     * Returns a [TestBehaviour]. Used in Integration Tests.
     */
    val testBehaviour: TestBehaviour get() = TestBehaviourBase()

    override fun i18n(defaultLabel: CharSequence, args: List<Any?>): I18nLabelValue {
        val category = javaClass.kotlin.simpleName?.replace("Definition", "") ?: ""
        return I18nLabelValue(
            I18nKeyProvider.generateKey(namespace, category, defaultLabel),
            namespace,
            category,
            defaultLabel,
            args
        )
    }

    /**
     * Returns the entity with the specified name and optional role.
     */
    fun entity(name: String, role: String? = null): Entity =
        Entity(
            EntityType(name.withNamespace(namespace)),
            role ?: name.withoutNamespace(namespace)
        )

    /**
     * Returns an [I18nTranslator] for the specified [userLocale] and [connectorType].
     */
    fun i18nTranslator(
        userLocale: Locale,
        connectorType: ConnectorType,
        userInterfaceType: UserInterfaceType = connectorType.userInterfaceType,
        contextId: String? = null
    ): I18nTranslator =
        object : I18nTranslator {
            override val userLocale: Locale get() = userLocale
            override val userInterfaceType: UserInterfaceType get() = userInterfaceType
            override val targetConnectorType: ConnectorType get() = connectorType
            override val contextId: String? get() = contextId

            override fun i18n(defaultLabel: CharSequence, args: List<Any?>): I18nLabelValue {
                return this@BotDefinition.i18n(defaultLabel, args)
            }
        }

    /**
     * Get the default delay between two answers.
     */
    fun defaultDelay(answerIndex: Int): Long = if (answerIndex == 0) 0 else defaultBreath

}
