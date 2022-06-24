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

package ai.tock.bot.statemachine

/**
 * Class that manages access to the state machine
 */
class StateMachine(val root: State) {

    fun getState(id: String): State? = getState(id, root)
    
    private fun getState(id: String, stateMachine: State): State? =
        when(stateMachine.id){
            id -> stateMachine
            else -> stateMachine.states?.firstNotNullOfOrNull { getState(id, it.value) }
        }

    fun getInitial(id: String): State? = getInitial(id, root)

    private fun getInitial(id: String, stateMachine: State): State? {
        val state = getState(id, stateMachine)
        return when(state?.states?.isEmpty()){
            null, true -> state
            else -> getInitial(state?.initial!!, state)
        }
    }

    fun getParent(id: String): State? = getParent(id, root)

    private fun getParent(id: String, stateMachine: State): State? =
        when(stateMachine.states?.any { entry -> entry.value.id == id }){
            true -> stateMachine
            else -> stateMachine.states?.firstNotNullOfOrNull { getParent(id, it.value) }
        }

    fun getNext(id: String, transition: String): State? = getNext(id, transition, root)

    private fun getNext(id: String, transition: String, stateMachine: State): State? {
        val currentState = getState(id, stateMachine)
        return currentState?.let {
            when(val nextStateId = currentState.on?.get(transition)){
                null -> getParent(id, stateMachine)?.let {
                    getNext(it.id, transition, stateMachine) }
                else -> getInitial(nextStateId.drop(1), stateMachine)
            }
        }
    }

    fun containsTransition(transition: String): Boolean = containsTransition(transition, root)

    private fun containsTransition(transition: String, stateMachine: State): Boolean =
        if(stateMachine.on?.get(transition) != null){
            true
        } else if(stateMachine.states == null){
            false
        } else {
            stateMachine.states.any { containsTransition(transition, it.value) }
        }

    fun getAllTransitions(): Set<String> = getAllTransitions(root)

    private fun getAllTransitions(stateMachine: State): Set<String> {
        val transitions = mutableSetOf<String>()

        transitions.addAll(stateMachine.on?.keys ?: emptySet())
        stateMachine.states?.values?.forEach {
            transitions.addAll(getAllTransitions(it))
        }

        return transitions.toSet()
    }

    fun getAllStatesNotGroup(): Set<String> = getAllStatesNotGroup(root)

    private fun getAllStatesNotGroup(stateMachine: State): Set<String> {
        val ids = mutableSetOf<String>()

        if(stateMachine.states == null || stateMachine.states.isEmpty()){
            ids.add(stateMachine.id)
        } else {
            stateMachine.states.values.forEach {
                ids.addAll(getAllStatesNotGroup(it))
            }
        }

        return ids.toSet()
    }
}
