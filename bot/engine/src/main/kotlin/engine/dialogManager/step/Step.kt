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

package engine.dialogManager.step

import ai.tock.bot.definition.EntityStepSelection
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.bot.engine.user.UserTimeline
import java.util.concurrent.ConcurrentHashMap

/**
 * step -> intent default behaviour.
 */
internal val stepToIntentRepository = ConcurrentHashMap<Step<*>, IntentAware>()

/**
 * Use this step when you want to set a null [Step].
 */
val noStep = object : SimpleStoryStep {
    override val name: String = "_NO_STEP_"
}

/**
 * A step is a part of a [StoryDefinition]. //TODO: Step is now a part of an abstraction of story
 * Used to manage workflow in a [StoryHandler]. //TODO: workfow in a handler, not only a StoryHandler
 */
interface Step<T> {

    /**
     * The name of the step.
     */
    val name: String

    /**
     * The custom answer for this step.
     * When returning a null value,
     * it means that the step is not able to answer to the current request.
     *
     * Default implementation returns null.
     */
    fun answer(): T.() -> Any? = { null }

    /**
     * Returns [intent] or the [ScriptDefinition.mainIntent] if [intent] is null.
     */
    val baseIntent: IntentAware get() = intent ?: stepToIntentRepository[this] ?: error("no intent for $this")

    /**
     * The main intent of the step.
     * If not null and if the current intent is equals to [intent],
     * this step will be automatically selected to be the current step.
     */
    val intent: IntentAware?
        get() = null

    /**
     * Same behaviour than [intent] in the rare case when the step handle more than one intent.
     */
    val otherStarterIntents: Set<IntentAware>
        get() = emptySet()

    /**
     * The secondary intents of this step. If detected and if the current step is this step,
     * the current step remains this step.
     */
    val secondaryIntents: Set<IntentAware>
        get() = emptySet()

    /**
     * Does this Step has to be selected from the Bus?
     * This method is called if [StoryHandlerBase.checkPreconditions] does not call [BotBus.end].
     * If this functions returns true, the step is selected and remaining steps are not tested.
     */
    fun selectFromBus(): BotBus.() -> Boolean = { false }

    /**
     * Does this Step has to be automatically selected from the action context?
     * if returns true, the step is selected.
     */
    fun selectFromAction(userTimeline: UserTimeline, dialog: Dialog, action: Action, intent: IntentAware?): Boolean =
        intent != null && selectFromActionAndEntityStepSelection(action, intent) ?: supportStarterIntent(intent)

    /**
     * Does this Step has to be automatically selected from the dialog context?
     * if returns true, the step is selected.
     */
    fun selectFromDialog(userTimeline: UserTimeline, dialog: Dialog, intent: Intent?): Boolean =
        intent != null && selectFromDialogAndEntityStepSelection(dialog, intent) ?: supportStarterIntent(intent)

    /**
     * Does this step hast to be selected from its [entityStepSelection]?
     * Returns null if there is no [entityStepSelection].
     */
    fun selectFromActionAndEntityStepSelection(action: Action, intent: IntentAware? = null): Boolean? =
        entityStepSelection?.let { e ->
            if (intent != null && this.intent != null && !supportStarterIntent(intent)) false
            else if (e.value == null) action.hasEntity(e.entityRole)
            else action.hasEntityPredefinedValue(e.entityRole, e.value)
        }

    /**
     * Does this step hast to be selected from its [entityStepSelection]?
     * Returns null if there is no [entityStepSelection].
     */
    fun selectFromDialogAndEntityStepSelection(dialog: Dialog, intent: Intent? = null): Boolean? =
        entityStepSelection?.let { e ->
            if (intent != null && this.intent != null && !supportStarterIntent(intent)) false
            else if (e.value == null) dialog.state.hasEntity(e.entityRole)
            else dialog.state.hasEntityPredefinedValue(e.entityRole, e.value)
        }

    /**
     * Does this step support this intent as starter intent?
     */
    fun supportStarterIntent(i: IntentAware): Boolean =
        intent?.wrap(i) == true || otherStarterIntents.any { it.wrap(i) }

    /**
     * Does this step support this intent?
     */
    fun supportIntent(i: IntentAware): Boolean = supportStarterIntent(i) || secondaryIntents.any { it.wrap(i) }

    /**
     * The optional children of the step.
     */
    val children: Set<Step<T>> get() = emptySet()

    /**
     * Flag indicating if it's the step has no children.
     */
    val hasNoChildren: Boolean get() = children.isEmpty()

    /**
     * If not null, entity has to be set in the current action to trigger the step.
     */
    val entityStepSelection: EntityStepSelection? get() = null
}

