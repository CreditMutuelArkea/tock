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

package ai.tock.bot.engine

import ai.tock.bot.connector.ConnectorMessage
import ai.tock.bot.connector.ConnectorType
import ai.tock.bot.definition.BotAnswerInterceptor
import ai.tock.bot.engine.BotRepository.registerBotAnswerInterceptor
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.ActionPriority.urgent
import ai.tock.bot.engine.action.SendChoice
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.dialog.DialogState
import ai.tock.bot.engine.dialog.Story
import ai.tock.bot.engine.dialogManager.DialogManagerStory
import ai.tock.bot.engine.message.Choice
import ai.tock.bot.engine.message.Sentence
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.engine.user.UserPreferences
import ai.tock.translator.I18nLabelValue
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.Locale
import kotlin.test.BeforeTest
import kotlin.test.assertEquals
import kotlin.test.assertNull

/**
 *
 */
class BotBusTest : BotEngineTest() {

    @BeforeTest
    fun init() {
        BotRepository.botAnswerInterceptors.clear()
    }

    @Test
    fun `GIVEN not notified action WHEN the intent is not a enable intent THEN the bot is not activated`() {
        val dialog = mockk<Dialog>()
        val state = DialogState()
        every { dialog.state } returns state
        val result = bot.canEnableBot(mockk(), mockk())
        kotlin.test.assertFalse(result)
    }

    @Test
    fun withSignificance_hasToUpdateActionSignificance() {
        bus.withPriority(urgent).end()

        every { connector.loadProfile(any(), any()) } returns UserPreferences()
        every { connector.connectorType } returns ConnectorType("test")

        verify { connector.send(match { param -> param is Action && param.metadata.priority == urgent }, any(), any()) }
    }

    @Test
    fun step_shouldReturnsAStep_whenTheStepIsDefinedInTheStoryDefinition() {
        userAction = action(Choice("test", StepTest.s1))
        bot.handle(userAction, userTimeline, connectorController, connectorData)
        assertEquals(StepTest.s1, registeredBus!!.step)
    }

    @Test
    fun step_shouldReturnsNull_whenTheStepIsNotDefinedInTheStoryDefinition() {
        userAction = action(Choice("test", mapOf(SendChoice.STEP_PARAMETER to "not defined")))
        bot.handle(userAction, userTimeline, connectorController, connectorData)
        assertNull(registeredBus!!.step)
    }

    @Test
    fun reloadProfile_shouldRemoveFirstNameAndLastNamePreferencesValues_whenConnectorLoadProfileReturnsNull() {
        every { connector.loadProfile(any(), any()) } returns null
        bus.userPreferences.firstName = "firstName"
        bus.userPreferences.lastName = "lastName"
        bus.reloadProfile()
        assertNull(bus.userPreferences.firstName)
        assertNull(bus.userPreferences.lastName)
    }

    @Test
    fun `handleAndSwitchStory switch story and run the new handler`() {
        //TODO: pareille que pour StoryHandlerBaseTest, il faut revoir le test pour ne pas avoir besoin d'allez chercher la story
        assertEquals(test, (bus.dialogManager.dialogT.currentScript as Story).definition)
        bus.handleAndSwitchScript(test2)
        assertEquals(test2, (bus.dialogManager.dialogT.currentScript as Story).definition)
        verify {
            connector.send(
                match<SendSentence> {
                    it.text.toString() == "StoryHandler2Test"
                },
                any()
            )
        }
    }

    @Test
    fun `switchStory switch story and keep the step if relevant`() {
        bus.dialogManager.switchScript(withoutStep, action = bus.action)
        bus.step = StepTest.s1
        bus.dialogManager.switchScript(test2, action = bus.action)
        assertEquals(test2, (bus.dialogManager.dialogT.currentScript as Story).definition)
        assertEquals(StepTest.s1, bus.step)
    }

    @Test
    fun `switchStory switch story and does not keep the step if not relevant`() {
        //TODO: il faut trouver une solution, là ça ne va pas
        // peut être une méthode équals, et on delegue au dialog manager le check
        assertEquals(test, (bus.dialogManager.dialogT.currentScript as Story).definition)
        bus.step = StepTest.s1
        bus.dialogManager.switchScript(withoutStep, action = bus.action)
        assertEquals(withoutStep, (bus.dialogManager.dialogT.currentScript as Story).definition)
        assertNull(bus.step)
        assertEquals(withoutStep, (bus.dialogManager.dialogT.scripts.last() as Story).definition)
    }

    @Test
    fun `default delay is used WHEN multiple sentences are sent`() {
        val actionsList = mutableListOf<Long>()
        every { connector.send(any(), any(), capture(actionsList)) } returns Unit
        bus.send("test")
        bus.send("test2")
        bus.end("test3")
        assertEquals(listOf(0L, 1000L, 2000L), actionsList)
    }

    @Test
    fun `bus context value is automatically casted`() {
        bus.setBusContextValue("a", Locale.CANADA)
        val v: Locale? = bus.getBusContextValue("a")
        assertEquals(Locale.CANADA, v)
    }

    @Test
    fun `i18nKey returns a I18nLabelValue with the right key and category`() {
        val v = bus.dialogManager.i18nKey(botDefinition, "a", "b")
        assertEquals(
            I18nLabelValue(
                "a",
                "app",
                "test",
                "b"
            ),
            v
        )
    }

    @Test
    fun `GIVEN no botAnswerInterceptor configured WHEN bot handle THEN connector send no altered message`() {
        bot.handle(userAction, userTimeline, connectorController, connectorData)
        verify {
            connector.send(
                match { param -> param is SendSentence && param.stringText == "StoryHandlerTest" },
                any(),
                any()
            )
        }
    }

    @Test
    fun `GIVEN botAnswerInterceptor configured WHEN bot handle THEN connector send a new message`() {
        registerBotAnswerInterceptor(SimpleBotAnswerInterceptor())
        bot.handle(userAction, userTimeline, connectorController, connectorData)
        verify {
            connector.send(
                match { param -> param is SendSentence && param.stringText == "new response" },
                any(),
                any()
            )
        }
    }

    class SimpleBotAnswerInterceptor : BotAnswerInterceptor {
        override fun handle(action: Action, bus: BotBus): Action {
            return Sentence("new response").toAction(PlayerId(""), "applicationId", PlayerId(""))
        }
    }

    @Test
    fun `send with custom messages is ok`() {
        val messageProvider1: ConnectorMessage = mockk()
        every { messageProvider1.connectorType } returns ConnectorType("1")
        val messageProvider2: ConnectorMessage = mockk()
        every { messageProvider2.connectorType } returns ConnectorType("2")
        bus.send {
            bus.withMessage(messageProvider1)
            bus.withMessage(messageProvider2)
        }

        verify { connector.send(any(), any(), any()) }
    }

    @Test
    fun `send with text is ok`() {
        val messageProvider1: ConnectorMessage = mockk()
        every { messageProvider1.connectorType } returns ConnectorType("1")
        val messageProvider2: ConnectorMessage = mockk()
        every { messageProvider2.connectorType } returns ConnectorType("2")
        bus.send {
            "message"
        }

        verify { connector.send(and(ofType<SendSentence>(), match { (it as SendSentence).stringText == "message" }), any(), any()) }
    }

    @Test
    fun `switchStory set the switch story key to true`() {
        bus.dialogManager.switchScript(test2, action = bus.action)
        assertTrue(bus.hasCurrentSwitchStoryProcess)
    }

    @Test
    fun `handleAndSwitchStory remove the switch story key`() {
        bus.handleAndSwitchScript(test2)
        assertFalse(bus.hasCurrentSwitchStoryProcess)
    }

    @Test
    fun `switchStory set starterIntent to mainIntent in currentStory of dialog by default`() {
        bus.dialogManager.switchScript(story_with_other_starter, action = bus.action)
        assertTrue(story_with_other_starter.wrap((bus.dialogManager.dialogT.currentScript as Story).starterIntent))
    }

    @Test
    fun `switchStory set starterIntent in currentStory of dialog if specified`() {
        bus.dialogManager.switchScript(story_with_other_starter, secondaryIntent, action = bus.action)
        assertTrue(secondaryIntent.wrap((bus.dialogManager.dialogT.currentScript as Story).starterIntent))
    }

    @Test
    fun `handleAndSwitchStory set starterIntent to mainIntent in currentStory of dialog by default`() {
        bus.handleAndSwitchScript(story_with_other_starter)
        assertTrue(story_with_other_starter.wrap((bus.dialogManager.dialogT.currentScript as Story).starterIntent))
    }

    @Test
    fun `handleAndSwitchStory set starterIntent in currentStory of dialog if specified`() {
        bus.handleAndSwitchScript(story_with_other_starter, secondaryIntent)
        assertTrue(secondaryIntent.wrap((bus.dialogManager.dialogT.currentScript as Story).starterIntent))
    }

    @Test
    fun `switchStory set a new story only once`() {
        bus.dialogManager.switchScript(test2, action = bus.action)
        assertEquals(test, (bus.dialogManager.dialogT as Dialog).scripts[0].definition)
        assertEquals(test2, (bus.dialogManager.dialogT as Dialog).scripts[1].definition)
        assertEquals(2, (bus.dialogManager.dialogT as Dialog).scripts.size)
    }

    @Test
    fun `GIVEN sendChoice with step WHEN switchStory THEN step of send choice is not forced`() {
        userAction = action(Choice("test", StepTest.s1))
        bus.step = StepTest.s2
        bus.handleAndSwitchScript(test2)
        assertEquals(test, (bus.dialogManager.dialogT as Dialog).scripts[0].definition)
        assertEquals(test2, (bus.dialogManager.dialogT as Dialog).scripts[1].definition)
        assertEquals(StepTest.s2, bus.step)
    }
}
