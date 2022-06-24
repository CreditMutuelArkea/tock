/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

package ai.tock.bot.bean

import ai.tock.bot.handler.HandlersRepository
import ai.tock.bot.statemachine.State
import ai.tock.bot.statemachine.StateMachine

/**
 * The tick story
 */
@kotlinx.serialization.Serializable
data class TickStory(
    val id: String? = null,
    val botId: String,
    val storyId: String,
    val name: String,
    val description: String,
    val stateMachine: State,
    val mainIntent: String,
    val primaryIntents: Set<String>,
    val secondaryIntents: Set<String>,
    val contexts: Set<TickContext>,
    val actions: Set<TickAction>,
    val debug: Boolean = false
) {

    // TODO : impact the frontend to use TickConfiguration

    fun validateTickStory(): List<String> {
        val errors = mutableListOf<String>()
        val sm = StateMachine(stateMachine)

        // Consistency between declared intentions and the state machine :
        // For each intention (primary and secondary) declared in the TickStory,
        // we must find a transition with the same name in the state machine
        val allIntents = listOf(mainIntent).union(primaryIntents).union(secondaryIntents)
        allIntents
            .filterNot { sm.containsTransition(it) }
            .forEach { errors.add("Intent $it not found in StateMachine") }

        // For each transition in the state machine,
        // we must find an intention of the same name in the TickStory
        sm.getAllTransitions()
            .filterNot { allIntents.contains(it) }
            .forEach {errors.add("Transition $it not found in TickStory intents") }

        // Consistency between declared actions and the state machine :
        // For each action declared in the TickStory,
        // we must find a state with the same name in the state machine
        actions
            .filter { sm.getState(it.name) == null }
            .forEach { errors.add("Action ${it.name} not found in StateMachine") }

        // For each state of the state machine that is not a grouping state,
        // there must be an action of the same name in the TickStory
        sm.getAllStatesNotGroup()
            .filterNot {state -> actions.any { it.name == state} }
            .forEach { errors.add("State $it not found in TickStory actions") }

        // Consistency of actions :
        // For each action declaring to execute business code,
        // we must find a class bearing the name of the handler declared in the action
        actions
            .filter { it.handler != null}
            .filterNot { HandlersRepository().contains(it.handler!!) }
            .forEach { errors.add("Action handler ${it.handler} not found in TickStory processor repository") }

        // Consistency of contexts :
        // For each context declared as input to an action,
        // there must be at least one other action producing the same context as output.
        actions.forEach {
                action ->
            run {
                action.inputContextNames.filterNot {
                        inputContextName ->
                    actions.filterNot { it == action }
                        .flatMap { it.outputContextNames }
                        .contains(inputContextName)
                }
                    .forEach {
                        errors.add("Input context $it of action ${action.name} not found in output contexts of others") }
            }
        }

        // For each context declared as output to an action,
        // there must be at least one other action requiring the same context as input.
        actions.forEach {
                action ->
            run {
                action.outputContextNames.filterNot {
                        inputContextName ->
                    actions.filterNot { it == action }
                        .flatMap { it.inputContextNames }
                        .contains(inputContextName)
                }
                    .forEach { errors.add("Output context $it of action ${action.name} not found in input contexts of others") }
            }
        }

        // All contexts are present at least in input or output of actions
        contexts
            .filterNot {
                actions.flatMap { it.inputContextNames.union(it.outputContextNames) }.contains(it.name) }
            .forEach { errors.add("Context ${it.name} not found in input/output contexts of TickStory actions") }

        return errors.toList()
    }
}

