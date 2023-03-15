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

import ai.tock.bot.*
import ai.tock.bot.bean.*
import ai.tock.bot.bean.unknown.TickUnknownConfiguration
import ai.tock.bot.sender.TickSender
import ai.tock.bot.statemachine.State
import io.mockk.*
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class TickStoryProcessorTest {
    init {
        System.setProperty("tock_bot_dialog_manager_debug_enabled", "false")
    }

    private val intentOui = "oui"
    private val intentNon = "non"
    private val intentBonjourRobot = "bonjourRobot"

    private val contextJeVeuxJouer = TickContext("JE_VEUX_JOUER")
    private val contextJeNeVeuxPasJouer = TickContext("JE_NE_VEUX_PAS_JOUER")
    private val contextDev1 = TickContext("DEV_CONTEXT_1")
    private val contextDev2 = TickContext("DEV_CONTEXT_2")
    private val contextDev3 = TickContext("DEV_CONTEXT_3")

    private val stateBonjour = State(id = "BONJOUR_HUMAIN")
    private val stateVeuxTuJouer = State(id = "VEUX_TU_JOUER")
    private val stateTicTacToe = State(id = "TIC_TAC_TOE")
    private val stateTantPis = State(id = "TANT_PIS")
    private val stateTantMieux = State(id = "TANT_MIEUX")
    private val stateAurevoir = State(id = "AU_REVOIR_HUMAIN")

    private val stateGroup = State(id = "GROUP", initial = stateAurevoir.id,
        states = setOf(stateBonjour, stateVeuxTuJouer, stateTicTacToe, stateTantPis, stateTantMieux, stateAurevoir).associateBy { it.id },
        on = mapOf(
                intentOui to "#${stateAurevoir.id}",
                intentNon to "#${stateAurevoir.id}",
            )
    )

    private val stateGlobal = State(id = "Global", initial = stateGroup.id,
        states = setOf(stateGroup).associateBy { it.id },
        on = mapOf(intentBonjourRobot to "#${stateGroup.id}")
    )

    private val stateMachine = State(
        id = "root", initial = "Global",
        states = mapOf("Global" to stateGlobal),
    )

    private val actionBonjour = TickAction(
        name =  stateBonjour.id,
        answerId = "app_scenario_Bonjour Humain",
        handler = "dev-tools:set_context_1",
        outputContextNames = setOf(contextDev1).map { it.name }.toSet(),
    )

    private val actionVeuxTuJouer = TickAction(
        name =  stateVeuxTuJouer.id,
        answerId = "app_scenario_Veux-tu jouer ?",
        handler = "dev-tools:set_context_2",
        inputContextNames = setOf(contextDev1).map { it.name }.toSet(),
        outputContextNames = setOf(contextDev2).map { it.name }.toSet(),
    )

    private val actionTicTacToe = TickAction(
        name =  stateTicTacToe.id,
        answerId = "app_scenario_Tic tac toe ?",
        inputContextNames = setOf(contextDev2).map { it.name }.toSet(),
        outputContextNames = setOf(contextJeVeuxJouer, contextJeNeVeuxPasJouer).map { it.name }.toSet(),
    )

    private val actionTantPis = TickAction(
        name =  stateTantPis.id,
        answerId = "app_scenario_Tant pis",
        handler = "dev-tools:set_context_3",
        inputContextNames = setOf(contextJeNeVeuxPasJouer).map { it.name }.toSet(),
        outputContextNames = setOf(contextDev3).map { it.name }.toSet(),
    )

    private val actionTantMieux = TickAction(
        name =  stateTantMieux.id,
        answerId = "app_scenario_Tant mieux",
        handler = "dev-tools:set_context_3",
        inputContextNames = setOf(contextJeVeuxJouer).map { it.name }.toSet(),
        outputContextNames = setOf(contextDev3).map { it.name }.toSet(),
    )

    private val actionAurevoir = TickAction(
        name =  stateAurevoir.id,
        answerId = "app_scenario_Au revoir Humain !",
        inputContextNames = setOf(contextDev3).map { it.name }.toSet(),
        final = true
    )

    private val intentsContexts = setOf(
        TickIntent(
            intentName = intentOui,
            associations = setOf(
                TickIntentAssociation(
                    actionName = actionTicTacToe.name,
                    contextNames = setOf(contextJeVeuxJouer.name)
                )
            )
        ),
        TickIntent(
            intentName = intentNon,
            associations = setOf(
                TickIntentAssociation(
                    actionName = actionTicTacToe.name,
                    contextNames = setOf(contextJeNeVeuxPasJouer.name)
                )
            )
        ),
    )

    private val tickConfigBonjourRobot = TickConfiguration(
        stateMachine = stateMachine,
        contexts = setOf(contextJeVeuxJouer, contextJeNeVeuxPasJouer, contextDev1),
        actions = setOf(actionBonjour, actionVeuxTuJouer, actionTicTacToe, actionTantPis, actionTantMieux, actionAurevoir),
        intentsContexts = intentsContexts,
        unknownHandleConfiguration = TickUnknownConfiguration(),
        storySettings = TickStorySettings.default
    )

    private val tickSender = mockk<TickSender>()

    @Test
    fun `process when user intent is intentBonjourRobot then process should success and sender send actionBonjourAanswerId then actionVeuxTuJouerAnswerId then end with actionTicTacToeAnswerId`() {

        val sendAnswersCaptured = mutableListOf<String>()
        val endAnswersCaptured = mutableListOf<String>()

        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session = TickSession(),
                configuration = tickConfigBonjourRobot,
                sender = tickSender,
                endingStoryRuleExists = false
            )
        }

        val mockBehaviours: TRunnable = {
            every { tickSender.sendById(capture(sendAnswersCaptured)) } answers {}
            every { tickSender.endById(capture(endAnswersCaptured)) } answers {}
        }

        val processCall: TFunction<TickStoryProcessor?, ProcessingResult> = {
            it!!.process(TickUserAction(intentBonjourRobot))
        }

        val checkResult: TConsumer<ProcessingResult?> = {
            assertNotNull(it)
            assert(it is Success)

            assertEquals(2, sendAnswersCaptured.size)
            assertEquals(1, endAnswersCaptured.size)

            verify(exactly = 1) { tickSender.sendById(actionBonjour.answerId!!) }
            verify(exactly = 1) { tickSender.sendById(actionVeuxTuJouer.answerId!!) }
            verify(exactly = 1) { tickSender.endById(actionTicTacToe.answerId!!) }

            verifyOrder {
                tickSender.sendById(actionBonjour.answerId!!)
                tickSender.sendById(actionVeuxTuJouer.answerId!!)
                tickSender.endById(actionTicTacToe.answerId!!)
            }
        }

        TestCase<TickStoryProcessor, ProcessingResult>("process a tick user action - cas 1")
            .given(
                setOf(
                    "user intent is intentBonjourRobot"
                ), produceProcessor)
            .and(
                setOf(
                    "sender is mocked and messages are captured",
                ), mockBehaviours)
            .`when`(
                setOf(
                    "process method is called"
                ), processCall)
            .then(
                setOf(
                "process should success",
                "sender send actionBonjour.answerId",
                "then send actionVeuxTuJouer.answerId",
                "then end with actionTicTacToe.answerId",
                ), checkResult)
            .run()
    }

    @Test
    fun `process when user intent is oui then process should success and sender send actionTantMieuxAnswerId then end with actionAurevoirAnswerId`() {

        val sendAnswersCaptured = mutableListOf<String>()
        val endAnswersCaptured = mutableListOf<String>()

        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session = TickSession(
                    currentState = stateTicTacToe.id,
                    contexts = setOf(contextDev1, contextDev2).associate { it.name to null },
                    ranHandlers=listOf(actionBonjour.name, actionVeuxTuJouer.name, actionTicTacToe.name),
                    objectivesStack = listOf(stateAurevoir.id),
                    handlingStep = TickActionHandlingStep(repeated=1, actionName=actionTicTacToe.name)),
                configuration = tickConfigBonjourRobot,
                sender = tickSender,
                endingStoryRuleExists = false
            )
        }

        val mockBehaviours: TRunnable = {
            every { tickSender.sendById(capture(sendAnswersCaptured)) } answers {}
            every { tickSender.endById(capture(endAnswersCaptured)) } answers {}
        }

        val processCall: TFunction<TickStoryProcessor?, ProcessingResult> = {
            it!!.process(TickUserAction(intentOui))
        }

        val checkResult: TConsumer<ProcessingResult?> = {
            assertNotNull(it)
            assert(it is Success)

            assertEquals(1, sendAnswersCaptured.size)
            assertEquals(1, endAnswersCaptured.size)

            verify(exactly = 1) { tickSender.sendById(actionTantMieux.answerId!!) }
            verify(exactly = 1) { tickSender.endById(actionAurevoir.answerId!!) }

            verifyOrder {
                tickSender.sendById(actionTantMieux.answerId!!)
                tickSender.endById(actionAurevoir.answerId!!)
            }
        }

        TestCase<TickStoryProcessor, ProcessingResult>("process a tick user action - cas 2")
            .given(
                setOf(
                    "user intent is intentOui"
                ), produceProcessor)
            .and(
                setOf(
                    "sender is mocked and messages are captured",
                ), mockBehaviours)
            .`when`(
                setOf(
                    "process method is called"
                ), processCall)
            .then(
                setOf(
                    "process should success",
                    "sender send actionTantMieux.answerId",
                    "then sender end with actionAurevoir.answerId"
                ), checkResult)
            .run()
    }

    @Test
    fun `process when user intent is oui and final action has no answer then process should success and sender send actionTantMieuxAnswerId then end with emtpy message`() {

        val sendAnswersCaptured = mutableListOf<String>()

        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session = TickSession(
                    currentState = stateTicTacToe.id,
                    contexts = setOf(contextDev1, contextDev2).associate { it.name to null },
                    ranHandlers=listOf(actionBonjour.name, actionVeuxTuJouer.name, actionTicTacToe.name),
                    objectivesStack = listOf(stateAurevoir.id),
                    handlingStep = TickActionHandlingStep(repeated=1, actionName=actionTicTacToe.name)),
                configuration = tickConfigBonjourRobot.copy(actions = tickConfigBonjourRobot.actions.map {
                    if(it.final){
                        it.copy(answerId = null)
                    } else {
                        it
                    }
                }.toSet()),
                sender = tickSender,
                endingStoryRuleExists = false
            )
        }

        val mockBehaviours: TRunnable = {
            every { tickSender.sendById(capture(sendAnswersCaptured)) } answers {}
            every { tickSender.end() } answers {}
        }

        val processCall: TFunction<TickStoryProcessor?, ProcessingResult> = {
            it!!.process(TickUserAction(intentOui))
        }

        val checkResult: TConsumer<ProcessingResult?> = {
            assertNotNull(it)
            assert(it is Success)

            assertEquals(1, sendAnswersCaptured.size)

            verify(exactly = 1) { tickSender.sendById(actionTantMieux.answerId!!) }
            verify(exactly = 1) { tickSender.end() }

            verifyOrder {
                tickSender.sendById(actionTantMieux.answerId!!)
                tickSender.end()
            }
        }

        TestCase<TickStoryProcessor, ProcessingResult>("process a tick user action - cas 3")
            .given(
                setOf(
                    "user intent is intentOui"
                ), produceProcessor)
            .and(
                setOf(
                    "sender is mocked and messages are captured",
                ), mockBehaviours)
            .`when`(
                setOf(
                    "process method is called"
                ), processCall)
            .then(
                setOf(
                    "process should success",
                    "sender send answerId",
                    "end with emtpy message",
                ), checkResult)
            .run()
    }

}