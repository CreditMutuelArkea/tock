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

package ai.tock.bot.handler.provider.joignabilite

import ai.tock.bot.bean.TickStory
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromStream
import java.io.File

class TickStoryJoignabilitePlafondsVirementTest {
//
//    @Test fun test1(){
//        val entities = mutableMapOf<String, String?>()
//        val tickSender = TickSenderDefault()
//        val tickStory = getTickStoryFromFile("JoignabilitePlafondsVirement", "processor", 1)
//
//        val processor = TickStoryProcessorRepository
//            .getProcessor(tickStory.storyId)
//            .setTickConfiguration(tickStory.toTickConfiguration())
//            .setTickSender(tickSender)
//
//        processor.handleUserAction(TickUserAction(
//            intentName = "i_probleme_virement",
//            entities = entities))
//
        // TODO MASS : faire les points suivants :
        // - dataset of intent and context
        // - Assert processor.getCurrentState()
        // - Assert historique
        // - color text console
//
//        assertNotNull(processor.getCurrentState())
//        assertTrue { tickSender.history.isNotEmpty() }
//
////        processor.handleUserAction(TickUserAction(
////            intentName = "i_preciser_destination",
////            entities = entities))
////
////        processor.getCurrentStat()
////
////        processor.handleUserAction(TickUserAction(
////            intentName = "i_probleme_virement",
////            entities = entities))
////
////        // Everything after this is in red
////        val red = "\u001b[31m"
////        // Resets previous color codes
////        val reset = "\u001b[0m"
////        println(red + "Hello World!" + reset)
//
//    }

    private fun getTickStoryFromFile(fileName: String, testGroup: String, testId: Int): TickStory {
        return Json.decodeFromStream(File("src/test/resources/tickstory/$fileName-$testGroup-$testId.json").inputStream())
    }
}