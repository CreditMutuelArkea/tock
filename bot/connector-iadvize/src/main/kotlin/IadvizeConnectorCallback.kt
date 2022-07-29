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

import ai.tock.bot.connector.ConnectorCallbackBase
import ai.tock.bot.connector.iadvize.model.request.ConversationsRequest
import ai.tock.bot.connector.iadvize.model.request.IadvizeRequest
import ai.tock.bot.connector.iadvize.model.request.MessageRequest
import ai.tock.bot.connector.iadvize.model.request.UnsupportedRequest
import ai.tock.bot.connector.iadvize.model.response.conversation.MessageResponse
import ai.tock.bot.connector.iadvize.model.response.conversation.payload.TextPayload
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeMessage
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeReply
import ai.tock.bot.engine.ConnectorController
import ai.tock.bot.engine.I18nTranslator
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.event.Event
import ai.tock.shared.defaultLocale
import ai.tock.shared.error
import ai.tock.shared.jackson.mapper
import ai.tock.shared.loadProperties
import io.vertx.core.http.HttpServerResponse
import io.vertx.ext.web.RoutingContext
import mu.KotlinLogging
import java.time.LocalDateTime
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList

private const val UNSUPPORTED_MESSAGE_REQUEST = "tock_iadvize_unsupported_message_request"

class IadvizeConnectorCallback(override val  applicationId: String,
                               val controller: ConnectorController,
                               val context: RoutingContext,
                               val request: IadvizeRequest,
                               val actions: MutableList<ActionWithDelay> = CopyOnWriteArrayList()) :
    ConnectorCallbackBase(applicationId, iadvizeConnectorType) {

    companion object {
        private val logger = KotlinLogging.logger {}
    }

    @Volatile
    private var answered: Boolean = false

    @Volatile
    private var locale: Locale = defaultLocale

    private val translator: I18nTranslator = controller.botDefinition.i18nTranslator(locale, iadvizeConnectorType)

    private val properties: Properties = loadProperties("/iadvize.properties")

    data class ActionWithDelay(val action: Action, val delayInMs: Long = 0)

    fun addAction(event: Event, delayInMs: Long) {
        if (event is Action) {
            actions.add(ActionWithDelay(event, delayInMs))
        } else {
            logger.trace { "unsupported event: $event" }
        }
    }

    override fun eventSkipped(event: Event) {
        super.eventSkipped(event)
        sendResponse()
    }

    override fun eventAnswered(event: Event) {
        super.eventAnswered(event)
        sendResponse()
    }

    fun sendResponse() {
        try {
            if (!answered) {
                answered = true

                context.response().endWithJson(buildResponse())
            }
        } catch (t: Throwable) {
            sendTechnicalError(t)
        }
    }

    private fun buildResponse(): MessageResponse {
        val response = MessageResponse(
            request.idConversation,
            request.idOperator,
            LocalDateTime.now(),
            LocalDateTime.now())

        return when(request) {
            is ConversationsRequest -> response

            is MessageRequest -> {
                response.replies.addAll(toListIadvizeReply(actions))
                return response
            }

            is UnsupportedRequest -> {
                logger.error("Request type ${request.type} is not supported by connector")
                //TODO: to be replaced by a transfer to a human when this type of message is supported
                val configuredMessage: String = properties.getProperty(UNSUPPORTED_MESSAGE_REQUEST, UNSUPPORTED_MESSAGE_REQUEST)
                val message: String = translator.translate(configuredMessage).toString()
                response.replies.add(IadvizeMessage(TextPayload(message)))
                return response
            }

            else -> response
        }
    }

    private fun toListIadvizeReply(actions: List<ActionWithDelay>): List<IadvizeReply> {
        return actions.map {
            if (it.action is SendSentence) {
                val listIadvizeReply: List<IadvizeReply> = it.action.messages.filterIsInstance<IadvizeReply>()
                if (it.action.text != null) {
                    //Extract text to a simple TextPayload
                    val message: String = translator.translate(it.action.text).toString()
                    val simpleTextPayload = IadvizeMessage(TextPayload(message))
                    //Combine 1 TextPayload with messages IadvizeReply
                    listOf(listOf(simpleTextPayload), listIadvizeReply).flatten()
                } else {
                    //No simple TextPayload, juste return IadvizeReply
                    listIadvizeReply
                }
            } else {
                emptyList()
            }
        }.flatten()
    }

    override fun exceptionThrown(event: Event, throwable: Throwable) {
        super.exceptionThrown(event, throwable)
        sendTechnicalError(throwable)
    }

    private fun sendTechnicalError(throwable: Throwable) {
        logger.error(throwable)
        context.fail(throwable)
    }

    private fun <T> HttpServerResponse.endWithJson(response: T?) {
        if(response != null) {
            logger.debug { "iAdvize response : $response" }

            val writeValueAsString = mapper.writeValueAsString(response)

            logger.debug { "iAdvize json response: $writeValueAsString" }

            return putHeader("Content-Type", "application/json").end(writeValueAsString)
        } else {
            return end()
        }
    }
}