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
package ai.tock.bot.connector.iadvize

import ai.tock.bot.connector.ConnectorData
import ai.tock.bot.connector.iadvize.model.request.IadvizeRequest
import ai.tock.bot.connector.iadvize.model.request.MessageRequest
import ai.tock.bot.connector.iadvize.model.request.MessageRequest.MessageRequestJson
import ai.tock.bot.connector.iadvize.model.response.conversation.Duration
import ai.tock.bot.connector.iadvize.model.response.conversation.Duration.TimeUnit.*
import ai.tock.bot.connector.iadvize.model.response.conversation.QuickReply
import ai.tock.bot.connector.iadvize.model.response.conversation.payload.TextPayload
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.*
import ai.tock.bot.engine.ConnectorController
import ai.tock.bot.engine.I18nTranslator
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.user.PlayerId
import ai.tock.shared.jackson.mapper
import ai.tock.shared.loadProperties
import ai.tock.shared.resource
import ai.tock.translator.I18nLabelValue
import ai.tock.translator.raw
import com.google.common.io.Resources
import io.mockk.*
import io.vertx.core.http.HttpServerResponse
import io.vertx.ext.web.RoutingContext
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals

/**
 *
 */
class IadvizeConnectorTest {

    val applicationId = "appId"
    val path = "/path"
    val editorURL = "/editorUrl"
    val firstMessage = "firstMessage"
    val distributionRule = "distributionRuleId"
    val connector = IadvizeConnector(applicationId, path, editorURL,firstMessage, distributionRule)
    val controller: ConnectorController = mockk(relaxed = true)
    val context: RoutingContext = mockk(relaxed = true)
    val response: HttpServerResponse = mockk(relaxed = true)
    val translator: I18nTranslator = mockk()
    val botName = "botName"
    val botId = "botId"
    val operateurId = "operateurId"
    val conversationId = "conversationId"

    val marcus: String = "MARCUS"

    @BeforeEach
    fun before() {
        every { context.response() } returns response
        every { response.putHeader("Content-Type", "application/json") } returns response
        every { controller.botConfiguration.name } returns botName
        every { controller.botDefinition.botId } returns botId
        every { context.pathParam("idOperator") } returns operateurId
        every { context.pathParam("idConversation") } returns conversationId

        every { controller.botDefinition.i18nTranslator(any(), any(), any(), any()) } returns translator
        val marcusAnswer = I18nLabelValue("", "", "", marcus)
        every { translator.translate(marcus) } returns marcusAnswer.raw

        // Force date to expected date
        mockkStatic(LocalDateTime::class)
        every { LocalDateTime.now() } returns LocalDateTime.of(2022, 4, 8, 16, 52, 37)
        every { LocalDateTime.of(2022, 4, 8, 16, 52, 37) } answers { callOriginal() }
    }

    @Test
    fun handleRequestWithoutQuickReply_shouldHandleWell_MessageMarcus() {
        val iAdvizeRequest: IadvizeRequest = getIadvizeRequestMessage("/request_message_text.json", conversationId)
        val expectedResponse: String = Resources.toString(resource("/response_message_marcus.json"), Charsets.UTF_8)

        val action = SendSentence(PlayerId("MockPlayerId"), "applicationId", PlayerId("recipientId"), "MARCUS")
        val connectorData = slot<ConnectorData>()
        every { controller.handle(any(), capture(connectorData)) } answers {
            val callback = connectorData.captured.callback as IadvizeConnectorCallback
            callback.addAction(action, 0)
            callback.eventAnswered(action)
        }

        connector.handleRequest(
            controller,
            context,
            iAdvizeRequest
        )

        verify { controller.handle(any(), any()) }

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handleRequestWithQuickReply_shouldHandleWell_MessageMarcus() {
        val iAdvizeRequest: IadvizeRequest = getIadvizeRequestMessage("/request_message_text.json", conversationId)
        val expectedResponse: String = Resources.toString(resource("/response_message_quickreply.json"), Charsets.UTF_8)

        val iadvizeReply: IadvizeReply = IadvizeMessage(TextPayload("MARCUS"), mutableListOf(QuickReply("MARCUS_YES"), QuickReply("MARCUS_NO")))

        val action = SendSentence(PlayerId("MockPlayerId"), "applicationId", PlayerId("recipientId"), text = null, messages = mutableListOf(iadvizeReply))
        val connectorData = slot<ConnectorData>()
        every { controller.handle(any(), capture(connectorData)) } answers {
            val callback = connectorData.captured.callback as IadvizeConnectorCallback
            callback.addAction(action, 0)
            callback.eventAnswered(action)
        }

        connector.handleRequest(
            controller,
            context,
            iAdvizeRequest
        )

        verify { controller.handle(any(), any()) }

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handleRequestWithIadvizeTransfer_shouldHandleWell_MessageMarcus() {
        val iAdvizeRequest: IadvizeRequest = getIadvizeRequestMessage("/request_message_text.json", conversationId)
        val expectedResponse: String = Resources.toString(resource("/response_message_transfer.json"), Charsets.UTF_8)

        val iadvizeTransfer: IadvizeReply = IadvizeTransfer(0)

        val action = SendSentence(PlayerId("MockPlayerId"), "applicationId", PlayerId("recipientId"), text = null, messages = mutableListOf(iadvizeTransfer))
        val connectorData = slot<ConnectorData>()
        every { controller.handle(any(), capture(connectorData)) } answers {
            val callback = connectorData.captured.callback as IadvizeConnectorCallback
            callback.addAction(action, 0)
            callback.eventAnswered(action)
        }

        connector.handleRequest(
            controller,
            context,
            iAdvizeRequest
        )

        verify { controller.handle(any(), any()) }

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handleRequestWithIadvizeMultipartMessage_shouldHandleWell_MessageMarcus() {
        val iAdvizeRequest: IadvizeRequest = getIadvizeRequestMessage("/request_message_text.json", conversationId)
        val expectedResponse: String = Resources.toString(resource("/response_message_multipart_transfer.json"), Charsets.UTF_8)

        val iadvizeMultipartReply = IadvizeMultipartReply(
            IadvizeAwait(Duration(100, millis)),
            IadvizeMessage("message info"),
            IadvizeTransfer(Duration(20, seconds)),
            IadvizeMessage("message after timeout"),
            IadvizeClose()
        )

        val action = SendSentence(
            PlayerId("MockPlayerId"),
            "applicationId",
            PlayerId("recipientId"),
            text = null,
            messages = mutableListOf(iadvizeMultipartReply)
        )

        val connectorData = slot<ConnectorData>()
        every { controller.handle(any(), capture(connectorData)) } answers {
            val callback = connectorData.captured.callback as IadvizeConnectorCallback
            callback.addAction(action, 0)
            callback.eventAnswered(action)
        }

        connector.handleRequest(
            controller,
            context,
            iAdvizeRequest
        )

        verify { controller.handle(any(), any()) }

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerGetBots_shouldHandleWell_TockBot() {
        val expectedResponse: String = Resources.toString(resource("/response_get_bots.json"), Charsets.UTF_8)

        connector.handlerGetBots(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerGetBot_shouldHandleWell_TockBot() {
        val expectedResponse: String = Resources.toString(resource("/response_get_bot.json"), Charsets.UTF_8)

        connector.handlerGetBot(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerUpdateBot_shouldHandleWell_TockBot() {
        val expectedResponse: String = Resources.toString(resource("/response_get_bot.json"), Charsets.UTF_8)

        connector.handlerUpdateBot(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerStrategies_shouldHandleWell_TockBot() {
        val expectedResponse: String = Resources.toString(resource("/response_strategy.json"), Charsets.UTF_8)

        connector.handlerStrategies(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerFirstMessage_shouldHandleWell_TockBot() {
        val expectedResponse: String = Resources.toString(resource("/response_first_message.json"), Charsets.UTF_8)

        connector.handlerFirstMessage(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerStartConversation_shouldHandleWell_TockBot() {
        val request: String = Resources.toString(resource("/request_history.json"), Charsets.UTF_8)
        val expectedResponse: String = Resources.toString(resource("/response_start_conversation.json"), Charsets.UTF_8)
        every { context.getBodyAsString() } returns request

        connector.handlerStartConversation(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerConversation_shouldHandleWell_TockBot() {
        val request: String = Resources.toString(resource("/request_message_text.json"), Charsets.UTF_8)
        val expectedResponse: String = Resources.toString(resource("/response_message_marcus.json"), Charsets.UTF_8)
        every { context.getBodyAsString() } returns request

        val action = SendSentence(PlayerId("MockPlayerId"), "applicationId", PlayerId("recipientId"), "MARCUS")
        val connectorData = slot<ConnectorData>()
        every { controller.handle(any(), capture(connectorData)) } answers {
            val callback = connectorData.captured.callback as IadvizeConnectorCallback
            callback.addAction(action, 0)
            callback.eventAnswered(action)
        }

        connector.handlerConversation(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)
    }

    @Test
    fun handlerEchoConversation_shouldHandleWell_TockBot() {
        val request: String = Resources.toString(resource("/request_message_text.json"), Charsets.UTF_8)
        val expectedResponse: String = Resources.toString(resource("/response_message_marcus.json"), Charsets.UTF_8)
        every { context.getBodyAsString() } returns request

        val action = SendSentence(PlayerId("MockPlayerId"), "applicationId", PlayerId("recipientId"), "MARCUS")
        val connectorData = slot<ConnectorData>()
        every { controller.handle(any(), capture(connectorData)) } answers {
            val callback = connectorData.captured.callback as IadvizeConnectorCallback
            callback.addAction(action, 0)
            callback.eventAnswered(action)
        }

        connector.handlerConversation(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)

        //echo
        connector.handlerConversation(context, controller)

        verify { response.end() }
    }

    @Test
    fun handlerConversationUnsupport_shouldDontCrash_TockBot() {
        val request: String = Resources.toString(resource("/request_message_unsupport.json"), Charsets.UTF_8)
        val expectedResponse: String = Resources.toString(resource("/response_message_unsupport.json"), Charsets.UTF_8)
        every { context.getBodyAsString() } returns request

        val properties: Properties = loadProperties("/iadvize.properties")
        val messageUnsupported: String = properties.getProperty("tock_iadvize_unsupported_message_request")
        val unsupportedAnswer = I18nLabelValue("", "", "", messageUnsupported)
        every { translator.translate(messageUnsupported) } returns unsupportedAnswer.raw

        connector.handlerConversation(context, controller)

        val messageResponse = slot<String>()
        verify { response.end(capture(messageResponse)) }
        assertEquals(expectedResponse, messageResponse.captured)

    }

    private fun getIadvizeRequestMessage(json: String, idConversation: String): IadvizeRequest {
        val messageRequestJson : MessageRequestJson = mapper.readValue(
            Resources.toString(resource(json), Charsets.UTF_8),
            MessageRequestJson::class.java)
        return MessageRequest(messageRequestJson, idConversation)
    }

}
