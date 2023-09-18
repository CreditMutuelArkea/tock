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

package ai.tock.bot.engine.config.rag

import ai.tock.bot.connector.ConnectorData
import ai.tock.bot.connector.ConnectorFeature
import ai.tock.bot.definition.Parameters
import ai.tock.bot.definition.notify
import ai.tock.bot.engine.BotBus
import ai.tock.bot.llm.rag.core.client.RagClient
import ai.tock.bot.llm.rag.core.client.models.RagQuery
import ai.tock.bot.llm.rag.core.client.models.RagResult
import ai.tock.shared.exception.error.ErrorMessageWrapper
import ai.tock.shared.exception.rest.RestException
import ai.tock.shared.injector
import ai.tock.shared.provide
import io.netty.handler.codec.http.HttpResponseStatus
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import java.net.ConnectException

/**
 * Handler of a rag story answer
 */
object RagAnswerHandler {

    private val logger = KotlinLogging.logger {}
    private val ragClient: RagClient = injector.provide()

    internal fun handle(
        botBus: BotBus
    ) {
        with(botBus) {
            try {
                if (this.underlyingConnector.hasFeature(ConnectorFeature.PROACTIVE_MESSAGE, targetConnectorType)) {
                    val parameters = Parameters(
                        this.connectorData.metadata.plus(
                            (Pair(ConnectorData.PROACTIVE_MESSAGE,
                                callLLM(botBus)))
                        ).toMap()
                    )

                    notify(
                        applicationId = applicationId,
                        namespace = this.botDefinition.namespace,
                        botId = this.botDefinition.botId,
                        recipientId = this.userId,
                        intent = this.currentIntent!!,
                        parameters = parameters,
                        // error listener managing Throwable Exceptions
                        errorListener = { manageNoAnswerRedirection(this) }
                    )
                } else {
                    runBlocking {
                        launch {
                            end(callLLM(botBus))
                        }
                    }
                }
                //        TODO : check if error Listener is doing its job : seems NOT
            } catch (conn: ConnectException) {
                logger.error { "failed to connect to ${conn.message}" }
                manageNoAnswerRedirection(this)
            } catch (e: RestException) {
                if (e.httpResponseStatus.code() / 100 != 2) {
                    logger.error { "error during rag call ${e.message}" }
                }
                manageNoAnswerRedirection(this)
            }
        }
    }


    /**
     * Call the LLM
     * @param botBus
     * @return a specified answer from the LLM or close the conversation by managing noAnswer
     */
    private fun callLLM(botBus: BotBus): String {
        with(botBus) {
            logger.debug { "Rag config : ${botBus.botDefinition.ragConfiguration}" }
            val response: RagResult? =
                ragClient.ask(RagQuery(userText.toString(), applicationId, userId.id))

            // TODO MASS
            // Comment définir le fait que le RAG n'a pas pu trouver une réponse :
            // - Pas de documents sources retournés
            // - Avoir "noAnswerSentence" dans la réponse (est paramètré dans le RAG setting)
            // - Ko technique lors de l'appel de la stack python
            response?.answer?.let {
                if (!it.contains(botDefinition.ragConfiguration!!.noAnswerSentence)) {
                    //TODO to format per connector or other ?
                    return "$it " +
                            "${response.sourceDocuments}"
                    // TODO MASS : get langchain debug data
                } else {
                    throw RagNotFoundAnswerException()
                }
            } ?: throw RagNoAnswerException()
        }

    }

    /**
     * Manage story redirection when no answer redirection is filled
     * Use the handler of the configured story otherwise launch default unknown
     * @param botBus
     * @param configuration
     */
    private fun manageNoAnswerRedirection(botBus: BotBus) {
        with(botBus) {
            val noAnswerStory = botDefinition.ragConfiguration?.noAnswerStoryId?.let { noAnswerStoryId ->
                botBus.botDefinition.stories.firstOrNull { it.id == noAnswerStoryId.toString() }
            }
                ?: botDefinition.unknownStory

            noAnswerStory.storyHandler.handle(this)
        }
    }
}

/**
 * Unique Exception that throws a 204 code because RAG found no content
 * TODO : enhance the behavior
 */
class RagNotFoundAnswerException :
    RestException(ErrorMessageWrapper("No answer found in the documents"), HttpResponseStatus.NO_CONTENT)

class RagNoAnswerException : RestException(
    ErrorMessageWrapper("An error seems to occurs : No answer from the Rag"),
    HttpResponseStatus.SERVICE_UNAVAILABLE
)
