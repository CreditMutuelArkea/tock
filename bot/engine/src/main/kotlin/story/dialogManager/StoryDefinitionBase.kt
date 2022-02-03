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

package ai.tock.bot.story.dialogManager

import ai.tock.bot.definition.*
import ai.tock.bot.engine.BotBus
import ai.tock.bot.story.dialogManager.handler.SimpleStoryHandlerBase
import ai.tock.bot.engine.dialogManager.handler.ScriptHandler
import ai.tock.bot.story.definition.StoryTag
import ai.tock.translator.UserInterfaceType
import engine.dialogManager.step.Step
import engine.dialogManager.step.stepToIntentRepository

/**
 * Default [StoryDefinition] implementation.
 */
open class StoryDefinitionBase(
    val name: String,
    override val scriptHandler: ScriptHandler = {} as SimpleStoryHandlerBase,
    otherStarterIntents: Set<IntentAware> = emptySet(),
    secondaryIntents: Set<IntentAware> = emptySet(),
    stepsList: List<Step<*>> = emptyList(),
    unsupportedUserInterface: UserInterfaceType? = null,
    override val tags: Set<StoryTag> = emptySet()
) : StoryDefinition {

    override val steps: Set<Step<*>> =
        stepsList.apply {
            forEach {
                if (it.intent == null) {
                    stepToIntentRepository[it] = this@StoryDefinitionBase
                }
            }
        }.toSet()

    override val unsupportedUserInterfaces: Set<UserInterfaceType> = listOfNotNull(unsupportedUserInterface).toSet()

    override fun name(): String {
        return name
    }

    override val id: String get() = name
    override val starterIntents: Set<IntentAware> =
        setOf(Intent(name)) + otherStarterIntents.map { it.wrappedIntent() }.toSet()
    override val intents: Set<IntentAware> =
        setOf(Intent(name)) + (otherStarterIntents + secondaryIntents).map { it.wrappedIntent() }.toSet()

    open fun handle(bus: BotBus) = scriptHandler.handle(bus)

    override fun toString(): String = "Story[$name]"
}
