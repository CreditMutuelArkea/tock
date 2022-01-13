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

package ai.tock.bot.engine.dialogManager

import ai.tock.bot.DialogManager.ScriptManager
import ai.tock.bot.DialogManager.ScriptManagerStory
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.SendChoice
import ai.tock.bot.engine.dialog.*
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.bot.engine.user.UserPreferences
import ai.tock.bot.engine.user.UserTimeline
import ai.tock.bot.script.Script
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.nlp.api.client.model.Entity
import ai.tock.nlp.entity.Value

class DialogManagerStory(
    /**
     * The user timeline. Gets history and data about the user.
     */
    private val userTimeline: UserTimeline
): DialogManager<Dialog> {

    //TODO: il faudrait sans doute prévoir une recopie de la usertimeline
    // pour être certain qu'il n'y ai pas de corruption de la liste des dialogues par un process externe
    constructor(userTimeline: UserTimeline, action: Action) : this(userTimeline) {
        if(userTimeline.dialogs.isEmpty()) {
            userTimeline.dialogs.add(Dialog(setOf(userTimeline.playerId, action.recipientId)))
        }
    }

    /**
     * The current dialog for this user (may be different from the initial [dialog]).
     */
    private val currentDialog: Dialog
        get() = userTimeline.currentDialog!!

    /**
     * The current story.
     */
    private var currentStory: Story
        get() = currentDialog.scripts.lastOrNull()!!
        set(value) {
            currentDialog.scripts.add(value)
        }

    override val userPreferences: UserPreferences = userTimeline.userPreferences

    override var hasCurrentSwitchProcess: Boolean
        get() = currentDialog.state.hasCurrentSwitchStoryProcess
        set(isCurrent) {
            currentDialog.state.hasCurrentSwitchStoryProcess = isCurrent
        }

    /**
     * The current intent for this user (may be different from the initial [intent]).
     */
    override var currentIntent: IntentAware?
        get() = currentDialog.state.currentIntent
        set(intent: IntentAware?) {
            currentDialog.state.currentIntent = currentIntent
        }

    override val dialogId: String
        get() = currentDialog.id.toString()

    override val entityValues: Map<String, EntityStateValue>
        get() = currentDialog.state.entityValues

    override var nextUserActionState: NextUserActionState?
        get() = currentDialog.state.nextActionState
        set(value) {
            currentDialog.state.nextActionState = value
        }

    override fun add(dialog: Dialog) {
        userTimeline.dialogs.add(dialog)
    }

    override fun getCurrentStep(): SimpleStoryStep? {
        return currentDialog.currentScript?.currentStep
    }

    override fun changeCurrentStep(stepName: String?) {
        currentDialog.currentScript?.step = stepName
    }

    override fun changeState(role: String, newValue: EntityValue?) {
        currentDialog.state.changeValue(role, newValue)
    }

    override fun removeEntity(role: String) {
        currentDialog.state.resetValue(role)
    }

    override fun changeEntity(entity: Entity, newValue: Value?) {
        currentDialog.state.changeValue(entity, newValue)
    }

    override fun removeAllEntity() {
        currentDialog.state.resetAllEntityValues()
    }

    override fun resetState() {
        currentDialog.state.resetState()
    }

    override fun <T : Any> contextValue(name: String): T? {
        @Suppress("UNCHECKED_CAST")
        return currentDialog.state.context[name] as? T?
    }

    override fun changeContext(name: String, value: Any?) {
        currentDialog.state.setContextValue(name, value)
    }

    override fun cleanUserState() {
        userTimeline.userState.cleanup()
    }

    override fun setProfileLoaded(loaded: Boolean) {
        userTimeline.userState.profileLoaded = loaded
    }

    override fun isLastAction(action: Action): Boolean =
        userTimeline.lastAction?.run { this != action && metadata.lastAnswer } ?: false

    override fun resetLastActionState() {
        currentDialog.state.nextActionState = null
    }

    fun lastAction(): Action? =
        userTimeline.lastAction

    override fun addAction(action: Action): Boolean =
        currentStory.actions.add(action)

    override fun addSupport(bus: BotBus): Double =
        currentStory.support(bus)

    /**
     * retourne true si la story courante supporte l'action passer en parametre
     */
    private fun supportAction(action: Action): Boolean {
        //TODO: je ne sais pas pourquoi je ne peux pas mettre directement le currentIntent en paramettre du supportAction, à creuser
        val intent = currentIntent

        return intent != null && currentStory.supportAction(userTimeline, currentDialog, action, intent)
    }

    override fun prepareNextAction(scriptManager: ScriptManager, action: Action): Script {
        val story =
            if(!supportAction(action)) {
                val newStory = scriptManager.createScript(currentIntent, action.applicationId) as Story
                currentDialog.scripts.add(newStory)
                newStory
            } else {
                currentStory
            }

        story.computeCurrentStep(userTimeline, currentDialog, action, currentIntent)

        story.actions.add(action)

        // update action state
        action.state.intent = currentDialog.state.currentIntent?.name()
        action.state.step = story.step

        return story
    }

    override fun changeState(scriptManager: ScriptManager, choice: SendChoice, intent: IntentAware) {
        scriptManager as ScriptManagerStory
        // restore state if it's possible (old dialog choice case)
        if (intent != Intent.unknown) {
            // TODO use story id
            val previousIntentName: String? = choice.previousIntent()
            val applicationId: String = choice.applicationId
            if (previousIntentName != null) {
                val previousStory = scriptManager.findScriptDefinitionById(previousIntentName, applicationId)
                if (previousStory != scriptManager.unknownStory && previousStory.supportIntent(intent)) {
                    // the previous intent is a primary intent that support the new intent
                    val storyDefinition = scriptManager.findScriptDefinitionById(choice.intentName, applicationId)
                    if (storyDefinition == scriptManager.unknownStory) {
                        // the new intent is a secondary intent, may be we need to create a intermediate story
                        val currentStory = currentStory
                        if (currentStory == null
                            || !currentStory.supportIntent(intent)
                            || !currentStory.supportIntent(
                                scriptManager.findIntent(previousIntentName, applicationId)
                            )
                        ) {
                            currentDialog.scripts.add(
                                Story(previousStory as StoryDefinition, intent.wrappedIntent())
                            )
                        }
                    }
                }
            }
        }
        currentDialog.state.currentIntent = intent
    }

}