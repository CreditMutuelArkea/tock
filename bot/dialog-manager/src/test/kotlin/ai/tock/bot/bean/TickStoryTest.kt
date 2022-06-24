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

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TickStoryTest {

    @Test fun test1() {
        val tickStory = getTickStoryFromFile("JoignabilitePlafondsVirement", "validateTickStory", 1)
        val errors = tickStory.validateTickStory()
        assertTrue { errors.isEmpty() }
    }

    @Test fun test2() {
        val tickStory = getTickStoryFromFile("JoignabilitePlafondsVirement", "validateTickStory", 2)
        val errors = tickStory.validateTickStory()

        val expectedErrors = setOf(
            "Intent MAIN_INTENT_TEST not found in StateMachine",
            "Transition i_probleme_virement not found in TickStory intents",
            "Transition i_preciser_montant not found in TickStory intents",
            "State S_CHECK_SERVICE_AVAILABLE not found in TickStory actions",
            "Action handler HANDLER_TEST not found in TickStory processor repository",
            "Input context SERVICE_AVAILABLE of action S_ASK_TRANSFER_AMOUNT not found in output contexts of others",
            "Input context SERVICE_AVAILABLE of action S_ASK_TRANSFER_DESTINATION not found in output contexts of others",
            "Input context SERVICE_UNAVAILABLE of action S_SERVICE_UNAVAILABLE_REDIRECT not found in output contexts of others",
            "Input context RESOLVE_LIMIT_DONE_TEST_1 of action S_SERVICE_UNAVAILABLE_REDIRECT not found in output contexts of others",
            "Output context RESOLVE_LIMIT_DONE_TEST_2 of action S_RESOLVE_LIMIT not found in input contexts of others",
            "Context RESOLVE_LIMIT_DONE_TEST_3 not found in input/output contexts of TickStory actions"
        )

        println(errors)

        assertTrue { errors.isNotEmpty() }
        assertEquals(expectedErrors.size, errors.size)
        assertTrue { errors.containsAll(expectedErrors) }

    }

    @Test fun test3() {
        val tickStory = getTickStoryFromFile("JoignabilitePlafondsVirement", "validateTickStory", 3)
        val errors = tickStory.validateTickStory()

        val expectedErrors = setOf(
            "Intent i_probleme_virement not found in StateMachine",
            "Intent i_preciser_destination not found in StateMachine",
            "Transition i_probleme_virement_TEST not found in TickStory intents",
            "Transition i_preciser_destination_TEST not found in TickStory intents",
            "Action S_SHOW_MSG_CANNOT_CHANGE_LIMIT not found in StateMachine",
            "State S_SHOW_MSG_CANNOT_CHANGE_LIMIT_TEST not found in TickStory actions")

        assertTrue { errors.isNotEmpty() }
        assertEquals(expectedErrors.size, errors.size)
        assertTrue { errors.containsAll(expectedErrors) }
    }

    // Refacto cette methode
    private fun getTickStoryFromFile(fileName: String, testGroup: String, testId: Int): TickStory {
        return Json.decodeFromStream(File("src/test/resources/tickstory/$fileName-$testGroup-$testId.json").inputStream())
    }
}