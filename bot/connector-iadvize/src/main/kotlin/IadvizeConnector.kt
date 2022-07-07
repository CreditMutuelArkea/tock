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

import ai.tock.bot.connector.ConnectorBase
import ai.tock.bot.connector.ConnectorCallback
import ai.tock.bot.connector.ConnectorData
import ai.tock.bot.connector.ConnectorMessage
import ai.tock.bot.connector.iadvize.model.request.*
import ai.tock.bot.connector.iadvize.model.request.MessageRequest.MessageRequestJson
import ai.tock.bot.connector.iadvize.model.request.UnsupportedRequest.UnsupportedRequestJson
import ai.tock.bot.connector.iadvize.model.response.AvailabilityStrategies
import ai.tock.bot.connector.iadvize.model.response.Bot
import ai.tock.bot.connector.iadvize.model.response.BotUpdated
import ai.tock.bot.engine.ConnectorController
import ai.tock.bot.engine.event.Event
import ai.tock.shared.error
import mu.KotlinLogging
import ai.tock.bot.connector.iadvize.model.response.AvailabilityStrategies.Strategy.customAvailability
import ai.tock.bot.connector.iadvize.model.response.conversation.RepliesResponse
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeMessage
import ai.tock.bot.connector.media.MediaMessage
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.action.Action
import ai.tock.shared.jackson.mapper
import io.vertx.core.http.HttpServerResponse
import io.vertx.ext.web.Route
import io.vertx.ext.web.RoutingContext
import java.time.LocalDateTime

class IadvizeConnector internal constructor(
    val applicationId: String,
    val path: String,
    val editorUrl: String,
    val firstMessage: String
) : ConnectorBase(IadvizeConnectorProvider.connectorType) {

    companion object {
        private val logger = KotlinLogging.logger {}
    }

    val echo: MutableSet<String> = mutableSetOf()

    private val QUERY_ID_OPERATOR: String = "idOperator"
    private val QUERY_ID_CONVERSATION: String = "idConversation"

    private val TYPE_TEXT: String = "text"

    override fun register(controller: ConnectorController) {
        controller.registerServices(path) { router ->
            router.get("$path/external-bots")
                .handleAndCatchException(controller, handlerGetBots)

            router.get("$path/bots/:idOperator")
                .handleAndCatchException(controller, handlerGetBot)

            router.put("$path/bots/:idOperator")
                .handleAndCatchException(controller, handlerUpdateBot)

            router.get("$path/availability-strategies")
                .handleAndCatchException(controller, handlerStrategies)

            router.get("$path/bots/:idOperator/conversation-first-messages")
                .handleAndCatchException(controller, handlerFirstMessage)

            router.post("$path/conversations")
                .handleAndCatchException(controller, handlerStartConversation)

            router.post("$path/conversations/:idConversation/messages")
                .handleAndCatchException(controller, handlerConversation)
        }
    }

    /*
     * when an exception is produced during the processing of the handler, it must be intercepted,
     *  logged, then produce an error 500 without an explicit message to not expose vulnerabilities.
     *
     * iAdvizeHandler is wrapped in a FunctionalInterface Handler<RoutingContext>
     *  and provided to the Route.handler(...) method
     */
    private fun Route.handleAndCatchException(controller: ConnectorController, iadvizeHandler: IadvizeHandler) {
        handler { context ->
            try {
                iadvizeHandler.invoke(context, controller)
            } catch (error: Throwable) {
                logger.error(error)
                context.fail(500)
            }
        }
    }

    internal var handlerGetBots: IadvizeHandler = { context, controller ->
        logger.info { "request : GET /external-bots\nbody : ${context.getBodyAsString()}" }
        context.response().endWithJson(listOf(getBot(controller)))
    }

    internal var handlerGetBot: IadvizeHandler = { context, controller ->
        val idOperator: String = context.pathParam(QUERY_ID_OPERATOR)
        logger.info { "request : GET /bots/$idOperator\nbody : ${context.getBodyAsString()}" }
        context.response().endWithJson(getBotUpdate(idOperator, controller))
    }

    internal var handlerUpdateBot: IadvizeHandler = { context, controller ->
        val idOperator: String = context.pathParam(QUERY_ID_OPERATOR)
        logger.info { "request : PUT /bots/$idOperator\nbody : ${context.getBodyAsString()}" }
        context.response().endWithJson(getBotUpdate(idOperator, controller))
    }

    private fun getBotUpdate(idOperator: String, controller: ConnectorController): BotUpdated {
        return BotUpdated(idOperator, getBot(controller), LocalDateTime.now(), LocalDateTime.now())
    }

    private fun getBot(controller: ConnectorController): Bot {
        val botId: String = controller.botDefinition.botId
        val botName: String = controller.botConfiguration.name
        return Bot(idBot = botId, name = botName, editorUrl = editorUrl)
    }

    internal var handlerStrategies: IadvizeHandler = { context, controller ->
        logger.info { "request : GET /availability-strategies\nbody : ${context.getBodyAsString()}" }
        context.response().endWithJson(AvailabilityStrategies(strategy = customAvailability, availability = true))
    }

    internal var handlerFirstMessage: IadvizeHandler = { context, controller ->
        val idOperator: String = context.pathParam(QUERY_ID_OPERATOR)
        logger.info { "request : GET /bots/$idOperator/conversation-first-messages\nbody : ${context.getBodyAsString()}" }
        context.response().endWithJson(RepliesResponse(IadvizeMessage(firstMessage)))
    }

    internal var handlerStartConversation: IadvizeHandler = { context, controller ->
        logger.info { "request : POST /conversations\nbody : ${context.getBodyAsString()}" }
        val conversationRequest: ConversationsRequest =
            mapper.readValue(context.getBodyAsString(), ConversationsRequest::class.java)
        val callback = IadvizeConnectorCallback(applicationId, context, conversationRequest)
        callback.sendResponse()
    }

    internal var handlerConversation: IadvizeHandler = { context, controller ->
        val idConversation: String = context.pathParam(QUERY_ID_CONVERSATION)
        if (!isEcho(idConversation)) {
            logger.info { "request : POST /conversations/$idConversation/messages\nbody : ${context.getBodyAsString()}" }
            val iadvizeRequest: IadvizeRequest = mapRequest(idConversation, context)
            logger.info { "body parsed : $iadvizeRequest" }
            // warn echo message from iadvize
            echo.add(idConversation)
            handleRequest(controller, context, iadvizeRequest)
        } else {
            logger.info { "request echo : POST /conversations/$idConversation/messages ${context.getBodyAsString()}" }
            context.response().end()
        }
    }

    /*
     * if id conversation is in echo, it's an echo : do not treat request.
     */
    private fun isEcho(idConversation: String): Boolean {
        return echo.remove(idConversation)
    }

    private fun mapRequest(idConversation: String, context: RoutingContext): IadvizeRequest {
        val typeMessage: TypeMessage = mapper.readValue(context.getBodyAsString(), TypeMessage::class.java)
        return when (typeMessage.type) {
            //json doesn't contain idConversation, to prevent null pointer,
            // we use the inner class MessageRequestJson to enhance the json.
            TYPE_TEXT -> {
                val messageRequestJson: MessageRequestJson =
                    mapper.readValue(context.getBodyAsString(), MessageRequestJson::class.java)
                MessageRequest(messageRequestJson, idConversation)
            }
            else -> {
                val unsupportedRequestJson: UnsupportedRequestJson =
                    mapper.readValue(context.getBodyAsString(), UnsupportedRequestJson::class.java)
                UnsupportedRequest(unsupportedRequestJson, idConversation, typeMessage.type)
            }
        }
    }

    private fun <T> HttpServerResponse.endWithJson(response: T) {
        val response: String = mapper.writeValueAsString(response)
        logger.info { "response : $response" }
        return putHeader("Content-Type", "application/json").end(response)
    }

    override fun send(event: Event, callback: ConnectorCallback, delayInMs: Long) {
        val iadvizeCallback = callback as? IadvizeConnectorCallback
        iadvizeCallback?.addAction(event, delayInMs)
        if (event is Action && event.metadata.lastAnswer) {
            iadvizeCallback?.sendResponse()
        }
    }

    internal fun handleRequest(
        controller: ConnectorController,
        context: RoutingContext,
        iadvizeRequest: IadvizeRequest
    ) {
        val callback = IadvizeConnectorCallback(applicationId, context, iadvizeRequest)
        when (iadvizeRequest) {
            is MessageRequest -> {
                val event = WebhookActionConverter.toEvent(iadvizeRequest, applicationId)
                controller.handle(event, ConnectorData(callback))
            }

            //Only MessageRequest are supported, other message are UnsupportedMessage
            // and UnsupportedResponse can be send immediatly
            else -> callback.sendResponse()
        }
    }

    override fun toConnectorMessage(message: MediaMessage): BotBus.() -> List<ConnectorMessage> =
        MediaConverter.toConnectorMessage(message)
}