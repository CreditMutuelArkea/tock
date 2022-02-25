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

package ai.tock.bot.engine

import ai.tock.bot.DialogManager.ScriptManager
import ai.tock.bot.admin.bot.BotApplicationConfiguration
import ai.tock.bot.connector.ConnectorData
import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.SendAttachment
import ai.tock.bot.engine.action.SendChoice
import ai.tock.bot.engine.action.SendLocation
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.config.BotStoryDefinitionWrapper
import ai.tock.bot.engine.dialog.DialogT
import ai.tock.bot.engine.dialogManager.DialogManager
import ai.tock.bot.engine.dialogManager.DialogManagerFactory
import ai.tock.bot.engine.feature.DefaultFeatureType
import ai.tock.bot.engine.nlp.NlpController
import ai.tock.bot.engine.user.UserTimelineT
import ai.tock.shared.injector
import com.github.salomonbrys.kodein.instance
import mu.KotlinLogging
import java.util.Locale

/**
 *
 */
internal class Bot(
    botDefinitionBase: BotDefinition,
    val configuration: BotApplicationConfiguration,
    val supportedLocales: Set<Locale> = emptySet()
) {

    companion object {
        private val currentBus = ThreadLocal<BotBus>()

        /**
         * Helper method to returns the current bus,
         * linked to the thread currently used by the handler.
         * (warning: advanced usage only).
         */
        internal fun retrieveCurrentBus(): BotBus? = currentBus.get()
    }

    private val logger = KotlinLogging.logger {}

    private val nlp: NlpController by injector.instance()

    val botDefinition: BotStoryDefinitionWrapper = BotStoryDefinitionWrapper(botDefinitionBase)

    val scriptManager: ScriptManager
        get() = botDefinition.scriptManager

    fun support(
        action: Action,
        userTimeline: UserTimelineT<*>,
        connector: ConnectorController,
        connectorData: ConnectorData
    ): Double {
        connector as TockConnectorController

        userTimeline.loadProfileIfNotSet(connectorData, action, connector)

        val dialogManager: DialogManager<DialogT<*, *>> =
            DialogManagerFactory.createDialogManager(botDefinition, userTimeline, action)

        parseAction(action, dialogManager, connector)

        val bus = TockBotBus(connector, dialogManager, action, connectorData, botDefinition)

        //val story = getStory(userTimeline, dialog, action)
        dialogManager.prepareNextAction(scriptManager, action)

        return dialogManager.addSupport(bus)
    }

    /**
     * Handle the user action.
     */
    fun handle(
        action: Action,
        userTimeline: UserTimelineT<*>,
        connector: ConnectorController,
        connectorData: ConnectorData
    ) {
        connector as TockConnectorController

        userTimeline.loadProfileIfNotSet(connectorData, action, connector)

        val dialogManager: DialogManager<DialogT<*, *>> =
            DialogManagerFactory.createDialogManager(botDefinition, userTimeline, action)

        //TODO: découpler l'action et le changement d'état du dialog
        parseAction(action, dialogManager, connector)

        var shouldRespondBeforeDisabling = false
        if (userTimeline.userState.botDisabled && canEnableBot(dialogManager.currentIntent, action)) {
            logger.debug { "Enable bot for $action" }
            userTimeline.userState.botDisabled = false
            botDefinition.botEnabledListener(action)
        } else if (!userTimeline.userState.botDisabled && canDisableBot(dialogManager.currentIntent, action)) {
            logger.debug { "Disable bot for $action" }
            // in the case of stories with disabled tag we want to respond before disabling the bot
            shouldRespondBeforeDisabling = scriptManager.isDisabledIntent(dialogManager.currentIntent)
            if (!shouldRespondBeforeDisabling) {
                userTimeline.userState.botDisabled = true
            }
        } // if user state has changed, always persist the user. If not, test if the state is persisted
        else if (!botDefinition.hasToPersistAction(userTimeline, action)) {
            connectorData.saveTimeline = false
        }

        if (!userTimeline.userState.botDisabled) {
            dialogManager.currentIntent?.let { intent ->
                connector.sendIntent(intent, action.applicationId, connectorData)
            }
            connector.startTypingInAnswerTo(action, connectorData)

            //val script = getStory(dialogManager, scriptManager, action)
            val script = dialogManager.prepareNextAction(scriptManager, action)

            val bus = TockBotBus(connector, dialogManager, action, connectorData, botDefinition)

            if (bus.isFeatureEnabled(DefaultFeatureType.DISABLE_BOT)) {
                logger.info { "bot is disabled for the application" }
                bus.end("Bot is disabled")
                return
            }

            try {
                currentBus.set(bus)
                script.handle(bus)
                if (shouldRespondBeforeDisabling) {
                    userTimeline.userState.botDisabled = true
                }
            } finally {
                currentBus.remove()
            }
        } else {
            // refresh intent flag
            userTimeline.userState.botDisabled = true
            logger.debug { "bot is disabled for the user" }
        }
    }
    /**
     * Does this action trigger bot deactivation ?
     */
    fun canDisableBot(currentIntent: IntentAware?, action: Action): Boolean =
        action.state.notification || currentIntent?.let { scriptManager.isDisabledIntent(it) }?:false

    /**
     * Does this action trigger bot activation ?
     */
    fun canEnableBot(currentIntent: IntentAware?, action: Action): Boolean {
        return currentIntent?.let {
                    scriptManager.isEnabledIntent(it)
                            // send choice can reactivate disabled bot (if the intent is not a disabled intent)
                            || (botDefinition.isSendChoiceActivateBot(action)
                            && !scriptManager.isDisabledIntent(it))
                }?:false
    }

    private fun parseAction(
        action: Action,
        dialogManager: DialogManager<*>,
        connector: TockConnectorController
    ) {
        try {
            when (action) {
                is SendChoice -> {
                    parseChoice(action, dialogManager)
                }
                is SendLocation -> {
                    parseLocation(action, dialogManager)
                }
                is SendAttachment -> {
                    parseAttachment(action, dialogManager)
                }
                is SendSentence -> {
                    if (!action.hasEmptyText()) {
                        //TODO: là il y a un truc à faire ... ça touche au NLP donc à réfléchire sur la manière
                        nlp.parseSentence(action, dialogManager, connector, botDefinition)
                    }
                }
                else -> logger.warn { "${action::class.simpleName} not yet supported" }
            }
        } finally {
            // reinitialize lastActionState
            dialogManager.resetLastActionState()
            //dialog.state.nextActionState = null
        }
    }

    private fun parseAttachment(attachment: SendAttachment,  dialogManager: DialogManager<*>) {
         botDefinition.scriptManager.getHandleAttachmentIntent()?.let {
             dialogManager.currentIntent = it
        }
    }

    private fun parseLocation(location: SendLocation,  dialogManager: DialogManager<*>) {
        botDefinition.scriptManager.getUserLocationIntent()?.let {
            dialogManager.currentIntent = it
        }
    }

    private fun parseChoice(choice: SendChoice, dialogManager: DialogManager<*>) {
        botDefinition.findIntent(choice.intentName, choice.applicationId).let { intent ->
            dialogManager.changeState(scriptManager, choice, intent)
        }
    }

    private fun UserTimelineT<*>.loadProfileIfNotSet(
        connectorData: ConnectorData,
        action: Action,
        connector: TockConnectorController
    ) {
        if (!userState.profileLoaded) {
            val pref = connector.loadProfile(connectorData, playerId)
            if (pref != null) {
                userState.profileLoaded = true
                userState.profileRefreshed = true
                userPreferences.fillWith(pref)
            }
        } else if (!userState.profileRefreshed) {
            userState.profileRefreshed = true
            val pref = connector.refreshProfile(connectorData, playerId)
            if (pref != null) {
                userPreferences.refreshWith(pref)
            }
        }
        action.state.testEvent = userPreferences.test
    }

    fun markAsUnknown(sendSentence: SendSentence, userTimeline: UserTimelineT<*>) {
        nlp.markAsUnknown(sendSentence, userTimeline, botDefinition)
    }

    override fun toString(): String {
        return "$botDefinition - ${configuration.name}"
    }
}
