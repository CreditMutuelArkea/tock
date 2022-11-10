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

import ai.tock.bot.handler.ActionHandlersRepository
import ai.tock.bot.statemachine.StateMachine

/**
 * The tick story validation service
 */
object TickStoryValidation {

    fun validateIntents(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            val sm = StateMachine(stateMachine)
            // For each intent (primary and secondary) declared in the TickStory,
            // we must find a transition with the same name in the state machine
            val allIntents = listOf(mainIntent).union(primaryIntents).union(secondaryIntents)
            allIntents
                .filterNot { sm.containsTransition(it) }
                .forEach { errors.add("Intent $it not found in StateMachine") }
        }
        return errors
    }

    fun validateTickIntentNames(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            // For each TickIntent, the Intent used must be secondary,
            intentsContexts
                .map { it.intentName }
                .filterNot { it in secondaryIntents }
                .forEach { errors.add("Intent $it is not secondary, it cannot be associated to contexts") }
        }
        return errors
    }

    fun validateDeclaredIntentContexts(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            // For each TickIntentAssociation, the context used must be declared,
            intentsContexts
                .flatMap { it.associations }
                .flatMap { it.contextNames }
                .filterNot { contextName -> contextName in contexts.map { it.name } }
                .forEach { errors.add("Intent association context $it not found in declared contexts") }
        }
        return errors
    }

    fun validateTickIntentAssociationActions(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            // For each TickIntentAssociation, the action used must be declared,
            intentsContexts
                .flatMap { it.associations }
                .map { it.actionName }
                .filterNot { actionName -> actionName in actions.map { it.name } }
                .forEach { errors.add("Intent association action $it not found in declared actions") }
        }
        return errors
    }

    fun validateTransitions(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            val sm = StateMachine(stateMachine)
            // For each transition in the state machine,
            // we must find an intent of the same name in the TickStory
            val allIntents = listOf(mainIntent).union(primaryIntents).union(secondaryIntents)
            sm.getAllTransitions()
                .filterNot { allIntents.contains(it) }
                .forEach { errors.add("Transition $it not found in TickStory intents") }
        }
        return errors
    }

    fun validateActions(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            val sm = StateMachine(stateMachine)
            // For each action declared in the TickStory,
            // we must find a state with the same name in the state machine
            actions
                .filter { sm.getState(it.name) == null }
                .forEach { errors.add("Action ${it.name} not found in StateMachine") }
        }
        return errors
    }

    fun validateStates(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            val sm = StateMachine(stateMachine)
            // For each state of the state machine that is not a grouping state,
            // there must be an action of the same name in the TickStory
            sm.getAllStatesNotGroup()
                .filterNot { state -> actions.any { it.name == state } }
                .forEach { errors.add("State $it not found in TickStory actions") }
        }
        return errors
    }

    fun validateActionHandlers(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            // For each action declaring to execute business code,
            // we must find a class bearing the name of the handler declared in the action
            actions
                .filter { !it.handler.isNullOrBlank() }
                .filterNot { ActionHandlersRepository.contains(it.handler!!) }
                .forEach { errors.add("Action handler ${it.handler} not found in handlers repository") }
        }
        return errors
    }

    fun validateInputOutputContexts(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()

        val intentContexts = getIntentContexts(tickStory)
        val outputContext: (TickAction)->Set<String> = { it.outputContextNames.union(intentContexts) }
        val inputContext: (TickAction)->Set<String> = { it.inputContextNames.union(intentContexts) }

        // For each context declared as output to an action (or intent),
        // there must be at least one other action requiring the same context as input.
        errors.addAll(
            validateContexts(tickStory.actions, inputContext, outputContext).map {
                "Input context ${it.first} of action ${it.second} not found in output contexts of others"
            }
        )

        // For each context declared as input to an action,
        // there must be at least one other action (or intent) producing the same context as output.
        errors.addAll(
            validateContexts(tickStory.actions, outputContext, inputContext).map {
                "Output context ${it.first} of action ${it.second} not found in input contexts of others"
            }
        )

        return errors
    }

    private fun getIntentContexts(tickStory: TickStory): Set<String> {
        return tickStory.intentsContexts
            .flatMap { it.associations }
            .flatMap { it.contextNames }
            .toSet()
    }

    private fun validateContexts(actions: Set<TickAction>,
                                            first: (TickAction)->Set<String>,
                                            second: (TickAction)->Set<String>): List<Pair<String, String>> {
        // Returns the elements of the first set, except those that existed in the second
        return actions.flatMap { action ->
            val contexts = first(action)
            val contextsCompared = actions.filter { it.name != action.name }.flatMap { second(it) }.toSet()
            contexts.minus(contextsCompared).map { Pair(it, action.name) }
        }
    }


    fun validateDeclaredActionContexts(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        tickStory.actions
            .flatMap { it.inputContextNames.union(it.outputContextNames) }
            .toSet()
            .minus(tickStory.contexts.map { it.name }.toSet())
            .forEach {
                errors.add("Action context $it not found in declared contexts")
            }

        return errors
    }

    fun validateNames(tickStory: TickStory): List<String> {
        val errors = mutableListOf<String>()
        with(tickStory) {
            // Context names could not be used for Action handler name
            contexts
                .map { it.name }
                .intersect(actions.map { it.name }.toSet())
                .forEach { errors.add("The same name $it is used for Action handler and context") }
        }
        return errors
    }

    fun validateTickStory(tick: TickStory): Set<String> {
        val errors = mutableSetOf<String>()

        // Consistency between declared intents and the state machine transitions :
        errors.addAll(validateIntents(tick))
        errors.addAll(validateTransitions(tick))

        // Consistency between declared actions and the state machine states:
        errors.addAll(validateActions(tick))
        errors.addAll(validateStates(tick))

        // Consistency of action handlers :
        errors.addAll(validateActionHandlers(tick))

        // Consistency of contexts :
        errors.addAll(validateInputOutputContexts(tick))
        errors.addAll(validateDeclaredActionContexts(tick))

        // Consistency of tick intents :
        errors.addAll(validateTickIntentNames(tick))
        errors.addAll(validateTickIntentAssociationActions(tick))
        errors.addAll(validateDeclaredIntentContexts(tick))

        // Consistency of names :
        errors.addAll(validateNames(tick))

        return errors
    }
}
