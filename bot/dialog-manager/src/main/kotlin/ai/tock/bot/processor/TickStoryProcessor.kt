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

package ai.tock.bot.processor

import ai.tock.bot.bean.TickAction
import ai.tock.bot.bean.TickConfiguration
import ai.tock.bot.bean.TickSession
import ai.tock.bot.bean.TickUserAction
import ai.tock.bot.graphsolver.GraphSolver
import ai.tock.bot.handler.HandlersRepository
import ai.tock.bot.sender.TickSender
import ai.tock.bot.statemachine.StateMachine

/**
 * A processor of tick story, it orchestrates the use of the state machine and the solver.
 * It takes a session (current state, contexts,... ), a sender and a tick configuration
 */
class TickStoryProcessor(
        session: TickSession,
        private val configuration: TickConfiguration,
        private val sender: TickSender ) {

    private var contexts = session.contexts.toMutableMap()
    private var objectivesStack = Stack(session.objectivesStack)
    private var ranHandlers = session.ranHandlers.toMutableSet()
    private val stateMachine: StateMachine = StateMachine(configuration.stateMachine)
    private var currentState = session.currentState ?: getInitialState()

    /**
     * Call a state machine to get the initial state if it exists, or throws error exception
     */
    private fun getInitialState() = run {
        val initialState = stateMachine.getInitial("root")
        initialState ?: error("Initial state not found")
        initialState.id
    }

    /**
     * Update current state to default
     */
    private fun updateCurrentStateToDefault() { 
        currentState = getInitialState() 
    }

    /**
     * Execute a given tick action id
     */
    private fun execute(actionName: String): Pair<Boolean, Boolean> {
        val action = getTickAction(actionName)
        debug(action, input = true)

        // send answer if provided
        action.answerId?.let {
            sender.sendById(it,
                !configuration.debug && !action.isSilent())
        }

        // invoke handler if provided
        action.handler?.let{
            contexts.putAll(HandlersRepository().invoke(it, contexts))
        }

        debug(action, input = false)
        ranHandlers.add(action.name)
        return Pair(action.isSilent(),  action.final)
    }


    /**
     * Debug the input and output contexts of the actions
     */
    // TODO : to be improved to comply with all types of connector
    // TODO : frontend : make a component for debug messages
    private fun debug(action: TickAction, input: Boolean) {
        if(configuration.debug) {
            val message = "[DEBUG] ${action.name} : ${
                if (input) "INPUT" else "OUTPUT"} CONTEXTS [ ${
                    contexts.map { (key, value) -> "$key : $value" }
                            .joinToString (" | ")
                } ]"

            sender.sendPlainText(message)

            if(!input){
                sender.sendPlainText()
                if(!action.isSilent()){
                    sender.sendPlainText("---", true)
                }
            }
        }
    }

    /**
     * the main function to process the user action
     */
    fun process (tickUserAction : TickUserAction?): Pair<TickSession, Boolean> {
        var primaryObjective : String?

        if(tickUserAction != null){
            updateContexts(tickUserAction.entities)

            // Call to state machine to get the next state
            primaryObjective = stateMachine.getNext(
                currentState,
                tickUserAction.intentName)?.id

            primaryObjective ?: error("Next state not found")

            // TODO : next state = current state if actions.size == 1. What should we do ?
            if(primaryObjective.equals(currentState) && configuration.actions.size > 1) {
                error("Next state shouldn't be equals to the current state")
            } else {
                objectivesStack.push(primaryObjective)
            }
        }else{
            primaryObjective = objectivesStack.peek()
            currentState = primaryObjective!!
        }

        // Call to clyngor to get the secondary objective.
        // Randomly choose one among the multiple results
        val secondaryObjective = GraphSolver.solve(
            configuration.actions,
            contexts,
            getTickAction(primaryObjective!!),
            ranHandlers
        ).random()

        // Execute the action corresponding of secondary objective.
        val (isSilent, isFinal) = execute(secondaryObjective)

        when(primaryObjective){
            secondaryObjective -> {
                objectivesStack.pop()
                when(objectivesStack.isEmpty()) {
                    true -> updateCurrentStateToDefault()
                    else -> currentState = objectivesStack.peek()!!
                }
            }
            else -> currentState = secondaryObjective
        }

        // If the action is silent, then we restart the processing again, otherwise we send the results
        return if(isSilent) process(null)
        else Pair(TickSession(currentState, contexts, ranHandlers, objectivesStack.toList()), isFinal)
    }

    /**
     * Update contexts with entities value
     */
    private fun updateContexts(entities: Map<String, String?>) {
        configuration.contexts
                .filter { c -> c.entityRole != null }
                .forEach {
                    if(entities.contains(it.entityRole))
                        contexts.put(it.name, entities.get(it.entityRole))
                }
    }

    /**
     * Returns the tick action corresponding to the name,
     * or throws error exception if such a name is not present in the set.
     */
    private fun getTickAction(actionName: String): TickAction {
        val tickAction = configuration.actions.firstOrNull { it.name.equals(actionName) }
        tickAction ?: error("TickAction not found")
        return tickAction
    }
}