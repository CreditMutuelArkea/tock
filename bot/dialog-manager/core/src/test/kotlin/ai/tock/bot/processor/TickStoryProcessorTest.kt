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
import ai.tock.bot.bean.TickAction
import ai.tock.bot.bean.TickConfiguration
import ai.tock.bot.bean.TickSession
import ai.tock.bot.bean.TickUserAction
import ai.tock.bot.bean.unknown.*
import ai.tock.bot.graphsolver.GraphSolver
import ai.tock.bot.handler.ActionHandlersRepository
import ai.tock.bot.sender.TickSender
import ai.tock.bot.sender.TickSenderDefault
import ai.tock.bot.statemachine.State
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.*

internal class TickStoryProcessorTest {

    enum class StateIds(val value: String) {
        GLOBAL("Global"),
        STATE_1("State1"),
        STATE_2("State2"),
        STATE_3("State3")
    }

    enum class IntentNames(val value: String) {
        INTENT_1("intent1"),
        UNKNOWN_INTENT(UNKNOWN)
    }

    enum class TriggerNames(val  value: String){
         TRIGGER_1("trigger1")
    }

    enum class HandlerNames(val value: String) {
        HANDLER_1("handler1"),
        HANDLER_2("handler2"),
    }

    enum class ContextNames(val value: String) {
        CONTEXT_1("context1")
    }

    private lateinit var configuration: TickConfiguration
    private lateinit var session: TickSession
    private val sender = mockk<TickSender>()

    @BeforeEach
    internal fun setUp() {
        mockkObject(GraphSolver)
        mockkObject(ActionHandlersRepository)


        configuration = TickConfiguration(
            State(StateIds.GLOBAL.value,
                states = mutableMapOf(),
                on = mutableMapOf()
            ),
            actions = mutableSetOf(),
            contexts = mutableSetOf(),
            intentsContexts = mutableSetOf(),
            unknownHandleConfiguration = TickUnknownConfiguration(),
            debug = false
        )

        session = TickSession()
    }

    @AfterEach
    internal fun tearDown() {
        unmockkObject(GraphSolver)
        unmockkObject(ActionHandlersRepository)
    }

    @Test
    fun `process when executedAction with no trigger and no handler`() {

        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session,
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        ),
                        on = mapOf(
                            IntentNames.INTENT_1.value to "#${StateIds.STATE_1.value}"
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            handler = HandlerNames.HANDLER_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                ),
                TickSenderDefault(),
                false
            )
        }

        val mockBehaviours: TRunnable = {
            every { GraphSolver.solve(any(), any(), any(), any(), any()) } returns listOf(StateIds.STATE_3.value)
            every { ActionHandlersRepository.invoke(any(), any()) } returns mapOf(ContextNames.CONTEXT_1.value to null)
        }

        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.INTENT_1.value, emptyMap()))
        }

        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_3.value, currentState)
                assertEquals(1, ranHandlers.size)
                assertTrue { contexts.isEmpty() }
            }

            assertFalse { it.second }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with no trigger and no handler")

            .given("""
    - user intent "intent1" leads to a primary objective "State1"
    - secondary objective has no handler and no trigger
                   """, produceProcessor)

            .and("""
    - graph resolver find a secondary objective "State3"
    - secondary objective has no handler and no trigger
                    """, mockBehaviours)

            .`when`("""
    - processor.process method is called with a user intent "intent1"
                 """, processCall)

            .then("""
    - current state should be "State3"
    - session's ranHandlers should have one item "State3"
    - session's contexts should be empty
                """, checkResult)

            .run()
    }

    @Test
    fun `process when executedAction with handler and no trigger`() {

        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session.copy(
                    objectivesStack = listOf(
                        StateIds.STATE_1.value
                    )
                ),
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        ),
                        on = mapOf(
                            IntentNames.INTENT_1.value to "#${StateIds.STATE_2.value}"
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = true
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            handler = HandlerNames.HANDLER_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                ),
                TickSenderDefault(),
                false
            )
        }

        val mockBehaviours: TRunnable = {
            every { GraphSolver.solve(any(), any(), any(), match { it.name == StateIds.STATE_2.value }, any()) } returns listOf(StateIds.STATE_2.value)
            every { GraphSolver.solve(any(), any(), any(), match { it.name == StateIds.STATE_1.value }, any()) } returns listOf(StateIds.STATE_1.value)
            every { ActionHandlersRepository.invoke(any(), any()) } returns mapOf(ContextNames.CONTEXT_1.value to null)
        }

        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.INTENT_1.value, emptyMap()))
        }

        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_1.value, currentState)
                assertEquals(2, ranHandlers.size)
                assertTrue { ranHandlers.contains(StateIds.STATE_1.value) }
                assertTrue { ranHandlers.contains(StateIds.STATE_2.value) }
                assertTrue { contexts.containsKey(ContextNames.CONTEXT_1.value) }
            }

            assertTrue { it.second }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with handler and no trigger")

            .given("""
    - user intent "intent1" leads to a primary objective "State2"
    - "State2" objective has a handler and no trigger
    - session objectiveStack has one item "State1"
                   """, produceProcessor)

            .and("""
    - graph resolver find a secondary objective "State2" when primary objective is "State2"
    - graph resolver find a secondary objective "State1 when primary objective is "State1"
    - secondary objective has no handler and no trigger
                    """, mockBehaviours)

            .`when`("""
    - processor.process method is called with a user intent "intent1"
                 """, processCall)

            .then("""
    - current state should be "State1"
    - session's ranHandlers should have two items "State2" and "State1"
    - session's contexts should have one item
                """, checkResult)

            .run()
    }

    @Test
    fun `process when executedAction with trigger and no handler`() {

        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session,
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        ),
                        on = mapOf(
                            IntentNames.INTENT_1.value to "#${StateIds.STATE_1.value}",
                            TriggerNames.TRIGGER_1.value to "#${StateIds.STATE_2.value}"
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            trigger = TriggerNames.TRIGGER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                ),
                TickSenderDefault(),
                false
            )
        }

        val mockBehaviours: TRunnable = {
            every { GraphSolver.solve(any(), any(), any(), any(), any()) } returns listOf(StateIds.STATE_3.value)
            every { GraphSolver.solve(any(), any(), any(), match { it.name == StateIds.STATE_2.value }, any()) } returns listOf(StateIds.STATE_2.value)
            every { ActionHandlersRepository.invoke(any(), any()) } returns mapOf(ContextNames.CONTEXT_1.value to null)
        }

        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.INTENT_1.value, emptyMap()))
        }

        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_2.value, currentState)
                assertEquals(2, ranHandlers.size)
                assertTrue { ranHandlers.contains(StateIds.STATE_3.value) }
                assertTrue { ranHandlers.contains(StateIds.STATE_2.value) }
                assertTrue { contexts.isEmpty() }
            }

            assertFalse { it.second }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with trigger and no handler")

            .given("""
    - user intent "intent1" leads to a primary objective "State1"
    - trigger "trigger1" leads to a primary objective "State2"
    - secondary objective "State3" has trigger "trigger1"
                   """, produceProcessor)

            .and("""
    - graph resolver find a secondary objective "State2" when primary objective is "State2"
    - graph resolver find a secondary objective "State3" when primary objective another one
                    """, mockBehaviours)

            .`when`("""
    - processor.process method is called with a user intent "intent1"
                 """, processCall)

            .then("""
    - current state should be "State2"
    - session's ranHandlers should have two items "State3" and "State2"
    - session's contexts should be empty
                """, checkResult)

            .run()
    }

    @Test
    fun `process when unknown intent is detected and unknownAnswerConfig is provided`() {

        val msgCapture = slot<String>()

        val answerConfig1 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_1.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 1"
            )
        )
        val answerConfig2 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_2.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 2"
            )
        )
        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session.copy(ranHandlers = listOf(
                    StateIds.STATE_1.value,
                    StateIds.STATE_2.value
                ), currentState = StateIds.STATE_2.value),
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            handler = HandlerNames.HANDLER_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                    unknownHandleConfiguration = configuration.unknownHandleConfiguration.copy(
                        unknownAnswerConfigs = setOf(
                            answerConfig1,
                            answerConfig2
                        )
                    )
                ),
                sender,
                false
            )
        }

        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.UNKNOWN_INTENT.value, emptyMap()))
        }

        val mockBehaviours: TRunnable = {
            every { sender.sendById(capture(msgCapture)) } answers {
                println(msgCapture.captured)
            }
        }

        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_2.value, currentState)
                assertEquals(2, ranHandlers.size)
                assertTrue { contexts.isEmpty() }
                assertNotNull(unknownHandlingStep)
                assertEquals(1, it.first.unknownHandlingStep?.repeated)
                assertEquals(answerConfig2, it.first.unknownHandlingStep?.answerConfig)
            }

            assertFalse { it.second }

            assertEquals(answerConfig2.unknownAnswer.text, msgCapture.captured)

            verify(exactly = 1) { sender.sendById(answerConfig2.unknownAnswer.text) }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with no trigger and no handler")

            .given("""
    - current state is "state2"
    - ranHandlers are "intent1" and "intent2"
    - unknown handlers are provided for actions "state1" and "state2"
                   """, produceProcessor)

            .and("""
    - sended message is capture     
            """, mockBehaviours)

            .`when`("""
    - processor.process method is called with a user intent "unknown"
                 """, processCall)

            .then("""
    - current state should be "State2"
    - session's ranHandlers should have two items
    - session's contexts should be empty
    - session should have a not null unknownHandlingStep
    - the session's unknownHandlingStep must have repeated equals 1
    - the session's unknownHandlingStep must be linked to answerConfig2
                """, checkResult)

            .run()
    }

    @Test
    fun `process when unknown intent is detected and unknownAnswerConfig is not provided `() {

        val msgCapture = slot<String>()

        val answerConfig1 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_1.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 1"
            )
        )
        val answerConfig2 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_2.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 2"
            )
        )
        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session.copy(ranHandlers = listOf(
                    StateIds.STATE_1.value,
                    StateIds.STATE_2.value
                ), currentState = StateIds.STATE_2.value),
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                    unknownHandleConfiguration = configuration.unknownHandleConfiguration.copy(
                        unknownAnswerConfigs = setOf(
                            answerConfig1
                        )
                    )
                ),
                sender,
                false
            )
        }

        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.UNKNOWN_INTENT.value, emptyMap()))
        }

        val mockBehaviours: TRunnable = {
            every { sender.sendById(capture(msgCapture)) } answers {
                println(msgCapture.captured)
            }
            every { GraphSolver.solve(any(), any(), any(), any(), any()) } returns listOf(StateIds.STATE_3.value)
            every { ActionHandlersRepository.invoke(any(), any()) } returns mapOf(ContextNames.CONTEXT_1.value to null)

        }
        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_3.value, currentState)
                assertEquals(3, ranHandlers.size)
                assertTrue { contexts.isEmpty() }
                assertNull(unknownHandlingStep)
            }

            assertFalse { it.second }

            assertFalse(msgCapture.isCaptured)

            verify(exactly = 0) { sender.sendById(answerConfig2.unknownAnswer.text) }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with no trigger and no handler")

            .given("""
    - current state is "state2"
    - ranHandlers are "state1" and "state2"
    - unknown handler is provided for action "state1" only
                   """, produceProcessor)

            .and("""
    - sended message is capture  
    - graphsolver always returns state3
            """, mockBehaviours)

            .`when`("""
    - processor.process method is called with a user intent "unknown"
                 """, processCall)

            .then("""
    - current state should be "State2"
    - session's ranHandlers should have two items
    - session's contexts should be empty
    - session should have a not null unknownHandlingStep
    - the session's unknownHandlingStep must have repeated equals 1
    - the session's unknownHandlingStep must be linked to answerConfig2
                """, checkResult)

            .run()
    }

    @Test
    fun `process when unknown intent is detected and unknownHandlingStep already exist`() {

        val msgCapture = slot<String>()

        val answerConfig1 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_1.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 1"
            )
        )
        val answerConfig2 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_2.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 2"
            )
        )
        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session.copy(ranHandlers = listOf(
                    StateIds.STATE_1.value,
                    StateIds.STATE_2.value
                ),
                    currentState = StateIds.STATE_2.value,
                    unknownHandlingStep = UnknownHandlingStep(1, answerConfig2)
                ),
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            handler = HandlerNames.HANDLER_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                    unknownHandleConfiguration = configuration.unknownHandleConfiguration.copy(
                        unknownAnswerConfigs = setOf(
                            answerConfig1,
                            answerConfig2
                        )
                    )
                ),
                sender,
                false
            )
        }

        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.UNKNOWN_INTENT.value, emptyMap()))
        }

        val mockBehaviours: TRunnable = {
            every { sender.sendById(capture(msgCapture)) } answers {
                println(msgCapture.captured)
            }

        }
        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_2.value, currentState)
                assertEquals(2, ranHandlers.size)
                assertTrue { contexts.isEmpty() }
                assertNotNull(unknownHandlingStep)
                assertEquals(2, it.first.unknownHandlingStep?.repeated)
                assertEquals(answerConfig2, it.first.unknownHandlingStep?.answerConfig)
            }

            assertFalse { it.second }

            assertEquals(answerConfig2.unknownAnswer.text, msgCapture.captured)

            verify(exactly = 1) { sender.sendById(answerConfig2.unknownAnswer.text) }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with no trigger and no handler")

            .given("""
    - current state is "state2"
    - ranHandlers are "intent1" and "intent2"
    - unknown handlers are provided for actions "state1" and "state2"
                   """, produceProcessor)

            .and("""
    - sended message is capture     
            """.trimIndent(), mockBehaviours)

            .`when`("""
    - processor.process method is called with a user intent "unknown"
                 """, processCall)

            .then("""
    - current state should be "State2"
    - session's ranHandlers should have two items
    - session's contexts should be empty
    - session should have a not null unknownHandlingStep
    - the session's unknownHandlingStep must have repeated equals 2
    - the session's unknownHandlingStep must be linked to answerConfig2
                """, checkResult)

            .run()
    }

    @Test
    fun `process when unknown intent is detected and unknownAnswerConfig is provided and retryNb is exceeded`() {

        val answerConfig1 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_1.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 1"
            )
        )
        val answerConfig2 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_2.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 2"
            )
        )
        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session.copy(ranHandlers = listOf(
                    StateIds.STATE_1.value,
                    StateIds.STATE_2.value
                ),
                    currentState = StateIds.STATE_2.value,
                    unknownHandlingStep = UnknownHandlingStep(2, answerConfig2)),
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            handler = HandlerNames.HANDLER_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        )
                    ),
                    unknownHandleConfiguration = configuration.unknownHandleConfiguration.copy(
                        unknownAnswerConfigs = setOf(
                            answerConfig1,
                            answerConfig2
                        )
                    )
                ),
                sender,
                false
            )
        }

        val processCall: TFunction<TickStoryProcessor?, RetryExceededError> = {
            assertThrows {
                it!!.process(TickUserAction(IntentNames.UNKNOWN_INTENT.value, emptyMap()))
            }
        }

        val checkResult: TConsumer<RetryExceededError?> = {
            assertNotNull(it)
        }

        TestCase<TickStoryProcessor, RetryExceededError>("process when executedAction with no trigger and no handler")

            .given("""
    - current state is "state2"
    - ranHandlers are "intent1" and "intent2"
    - unknown handlers are provided for actions "state1" and "state2"
                   """, produceProcessor)

            .`when`("""
    - processor.process method is called with a user intent "unknown"
                 """, processCall)

            .then("""
    - A RetryExceededError is returned
                """, checkResult)

            .run()
    }

    @Test
    fun `process when unknown intent is detected and unknownAnswerConfig is provided, retryNb is exceeded ans exitAction is provided`() {

        val answerConfig1 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_1.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 1"
            )
        )
        val answerConfig2 = UnknownAnswerConfig(
            intent = UnknownIntent(),
            action = StateIds.STATE_2.value,
            exitAction = StateIds.STATE_3.value,
            unknownAnswer = UnknownAnswer(
                text = "unknown 2"
            )
        )
        val produceProcessor: TSupplier<TickStoryProcessor> = {
            TickStoryProcessor(
                session.copy(ranHandlers = listOf(
                    StateIds.STATE_1.value,
                    StateIds.STATE_2.value
                ),
                    currentState = StateIds.STATE_2.value,
                    unknownHandlingStep = UnknownHandlingStep(2, answerConfig2)),
                configuration.copy(
                    stateMachine = configuration.stateMachine.copy(
                        states =  mapOf(
                            StateIds.STATE_1.value to State(StateIds.STATE_1.value),
                            StateIds.STATE_2.value to State(StateIds.STATE_2.value),
                            StateIds.STATE_3.value to State(StateIds.STATE_3.value)
                        )
                    ),
                    actions =  setOf(
                        TickAction(
                            StateIds.STATE_1.value,
                            handler = HandlerNames.HANDLER_1.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_2.value,
                            handler = HandlerNames.HANDLER_2.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = false
                        ),
                        TickAction(
                            StateIds.STATE_3.value,
                            inputContextNames = setOf(),
                            outputContextNames = setOf(),
                            final = true
                        )
                    ),
                    unknownHandleConfiguration = configuration.unknownHandleConfiguration.copy(
                        unknownAnswerConfigs = setOf(
                            answerConfig1,
                            answerConfig2
                        )
                    )
                ),
                sender,
                false
            )
        }

        val mockBehaviours: TRunnable = {
            every { GraphSolver.solve(any(), any(), any(), any(), any()) } returns listOf(StateIds.STATE_3.value)
        }
        val processCall: TFunction<TickStoryProcessor?, Pair<TickSession, Boolean>> = {
            it!!.process(TickUserAction(IntentNames.UNKNOWN_INTENT.value, emptyMap()))
        }

        val checkResult: TConsumer<Pair<TickSession, Boolean>?> = {
            assertNotNull(it)

            assertNotNull(it)

            with(it.first) {
                assertEquals(StateIds.STATE_3.value, currentState)
                assertEquals(3, ranHandlers.size)
                assertTrue { contexts.isEmpty() }
                assertNull(unknownHandlingStep)
            }

            assertTrue { it.second }

            verify(exactly = 0) { sender.sendById(answerConfig2.unknownAnswer.text) }
        }

        TestCase<TickStoryProcessor, Pair<TickSession, Boolean>>("process when executedAction with no trigger and no handler")

            .given("""
    - current state is "state2"
    - ranHandlers are "intent1" and "intent2"
    - unknown handlers are provided for actions "state1" and "state2"
                   """, produceProcessor)
            .and("", mockBehaviours)
            .`when`("""
    - processor.process method is called with a user intent "unknown"
                 """, processCall)

            .then("""
    - A RetryExceededError is returned
                """, checkResult)

            .run()
    }


}