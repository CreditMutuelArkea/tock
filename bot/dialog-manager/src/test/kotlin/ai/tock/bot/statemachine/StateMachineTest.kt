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

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class StateMachineTest {

    @Test fun getState() {
        val root = getStateMachineFromFile("xstate.json")
        val stateMachine = StateMachine(root)

        val global = root.states?.get("Global")!!
        val introduction = global?.states?.get("INTRODUCTION")!!
        val sBookMeeting = global?.states?.get("S_BOOK_MEETING")!!
        val sAskChannel = sBookMeeting?.states?.get("S_ASK_CHANNEL")!!
        val sShowProcedureBookMeeting = sBookMeeting?.states?.get("S_SHOW_PROCEDURE_BOOK_MEETING")!!

        // Non-existing State
        check(stateMachine::getState, stateMachine, "TOTO", null, false)

        // Existing State
        check(stateMachine::getState, stateMachine, "root", root)
        check(stateMachine::getState, stateMachine, "Global", global)
        check(stateMachine::getState, stateMachine, "INTRODUCTION", introduction)
        check(stateMachine::getState, stateMachine, "S_BOOK_MEETING", sBookMeeting)
        check(stateMachine::getState, stateMachine, "S_ASK_CHANNEL", sAskChannel)
        check(stateMachine::getState, stateMachine, "S_SHOW_PROCEDURE_BOOK_MEETING", sShowProcedureBookMeeting)

        println(stateMachine.getAllTransitions().joinToString(" | "))
        println(stateMachine.getAllStatesNotGroup().joinToString(" | "))
    }

    @Test fun getParent() {
        val root = getStateMachineFromFile("xstate.json")
        val stateMachine = StateMachine(root)

        val global = root.states?.get("Global")!!
        val sBookMeeting = global?.states?.get("S_BOOK_MEETING")!!

        // Non-existing State
        check(stateMachine::getParent, stateMachine, "root", null, false)
        check(stateMachine::getParent, stateMachine, "TOTO", null, false)

        // Existing State
        check(stateMachine::getParent, stateMachine, "Global", root)
        check(stateMachine::getParent, stateMachine, "INTRODUCTION", global)
        check(stateMachine::getParent, stateMachine, "S_BOOK_MEETING", global)
        check(stateMachine::getParent, stateMachine, "S_ASK_CHANNEL", sBookMeeting)
        check(stateMachine::getParent, stateMachine, "S_SHOW_PROCEDURE_BOOK_MEETING", sBookMeeting)
    }

    @Test fun getInitial() {
        val root = getStateMachineFromFile("xstate.json")
        val stateMachine = StateMachine(root)

        val global = root.states?.get("Global")!!
        val introduction = global?.states?.get("INTRODUCTION")!!
        val sBookMeeting = global?.states?.get("S_BOOK_MEETING")!!
        val sAskChannel = sBookMeeting?.states?.get("S_ASK_CHANNEL")!!
        val sShowProcedureBookMeeting = sBookMeeting?.states?.get("S_SHOW_PROCEDURE_BOOK_MEETING")!!

        // Non-existing State
        check(stateMachine::getInitial, stateMachine, "TOTO", null, false)

        // Existing State
        check(stateMachine::getInitial, stateMachine, "root", introduction)
        check(stateMachine::getInitial, stateMachine, "Global", introduction)
        check(stateMachine::getInitial, stateMachine, "INTRODUCTION", introduction)
        check(stateMachine::getInitial, stateMachine, "S_BOOK_MEETING", sShowProcedureBookMeeting)
        check(stateMachine::getInitial, stateMachine, "S_ASK_CHANNEL", sAskChannel)
        check(stateMachine::getInitial, stateMachine, "S_SHOW_PROCEDURE_BOOK_MEETING", sShowProcedureBookMeeting)
    }

    @Test fun getNext() {
        val root = getStateMachineFromFile("xstate.json")
        val stateMachine = StateMachine(root)

        val global = root.states?.get("Global")!!
        val sBookMeeting = global?.states?.get("S_BOOK_MEETING")!!
        val sAskChannel = sBookMeeting?.states?.get("S_ASK_CHANNEL")!!
        val sShowProcedureBookMeeting = sBookMeeting?.states?.get("S_SHOW_PROCEDURE_BOOK_MEETING")!!

        // Non-existing State
        checkNext(stateMachine, "root", "ANY",null, false)
        checkNext(stateMachine, "TOTO", "ANY",null, false)
        checkNext(stateMachine, "Global", "i_book_physical_or_tel",null, false)
        checkNext(stateMachine, "S_BOOK_MEETING", "i_book_physical_or_tel_3", null, false)

        // Existing State
        checkNext(stateMachine, "Global", "i_ask_book_visio", sShowProcedureBookMeeting)
        checkNext(stateMachine, "S_BOOK_MEETING", "i_book_physical_or_tel", sShowProcedureBookMeeting)
        checkNext(stateMachine, "S_BOOK_MEETING", "i_book_physical_or_tel_2", sAskChannel)
    }


    private fun checkNext(stateMachine: StateMachine, id: String, transition: String, expectedState: State?, mustExist: Boolean = true) {
        val state = stateMachine.getNext(id, transition)
        assertEquals(expectedState, state)
        when(mustExist){
            true -> assertNotNull(state)
            else -> assertNull(state)
        }
    }

    private fun check(callable: (String) -> State?, stateMachine: StateMachine, id: String, expectedState: State?, mustExist: Boolean = true) {
        val state = callable(id)
        assertEquals(expectedState, state)
        when(mustExist){
            true -> assertNotNull(state)
            else -> assertNull(state)
        }
    }

    private fun getStateMachineFromFile(fileName: String): State {
        return Json.decodeFromStream<State>(File("src/test/resources/statemachine/$fileName").inputStream())
    }
}