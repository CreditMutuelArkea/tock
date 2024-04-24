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

package ai.tock.bot.engine.config

import ai.tock.bot.admin.bot.rag.BotRAGConfiguration
import ai.tock.bot.admin.indicators.IndicatorValues
import ai.tock.bot.admin.indicators.Indicators
import ai.tock.bot.admin.indicators.metric.MetricType
import ai.tock.bot.definition.RAGStoryDefinition
import ai.tock.bot.definition.StoryDefinition
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.BotRepository
import ai.tock.bot.engine.action.Footnote
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.action.SendSentenceWithFootnotes
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.user.PlayerType
import ai.tock.genai.orchestratorclient.requests.*
import ai.tock.genai.orchestratorclient.responses.RAGResponse
import ai.tock.genai.orchestratorclient.responses.TextWithFootnotes
import ai.tock.genai.orchestratorclient.retrofit.GenAIOrchestratorBusinessError
import ai.tock.genai.orchestratorclient.services.RAGService
import ai.tock.genai.orchestratorcore.utils.OpenSearchUtils
import ai.tock.shared.*
import engine.config.AbstractProactiveAnswerHandler
import mu.KotlinLogging

private val kNeighborsDocuments =
    intProperty(name = "tock_gen_ai_orchestrator_document_number_neighbors", defaultValue = 1)
private val nLastMessages = intProperty(name = "tock_gen_ai_orchestrator_dialog_number_messages", defaultValue = 10)
private val technicalErrorMessage = property(
    "tock_gen_ai_orchestrator_technical_error",
    defaultValue = property("tock_technical_error", "Technical error :( sorry!")
)
private val ragDebugEnabled = booleanProperty(name = "tock_gen_ai_orchestrator_rag_debug_enabled", defaultValue = false)

object RAGAnswerHandler : AbstractProactiveAnswerHandler {

    private val logger = KotlinLogging.logger {}
    private val ragService: RAGService get() = injector.provide()


    override fun handleProactiveAnswer(botBus: BotBus): StoryDefinition? {
        return with(botBus) {
            // Save story handled metric
            BotRepository.saveMetric(createMetric(MetricType.STORY_HANDLED))

            // Call RAG Api - Gen AI Orchestrator
            val (answer, debug, noAnswerStory) = rag(this)

            // Add debug data if available and if debugging is enabled
            if (debug != null && (connectorData.metadata["debugEnabled"].toBoolean() || ragDebugEnabled)) {
                logger.info { "Send RAG debug data." }
                sendDebugData("RAG", debug)
            }

            // Handle the RAG answer
            if (noAnswerStory == null && answer != null) {
                logger.info { "Send RAG answer." }
                send(
                    SendSentenceWithFootnotes(
                        botId, applicationId, userId, text = answer.text, footnotes = answer.footnotes.map {
                            Footnote(
                                it.identifier, it.title, it.url
                            )
                        }.toMutableList()
                    )
                )
            } else {
                logger.info { "No RAG answer to send, because a noAnswerStory is returned." }
            }

            noAnswerStory
        }
    }

    /**
     * Manage story redirection when no answer redirection is filled
     * Use the handler of the configured story otherwise launch default unknown story
     * @param botBus the bot Bus
     * @param response the RAG response
     */
    private fun ragStoryRedirection(botBus: BotBus, response: RAGResponse?): StoryDefinition? {
        return with(botBus) {
            botDefinition.ragConfiguration?.let { ragConfig ->
                if (response?.answer?.text.equals(ragConfig.noAnswerSentence, ignoreCase = true)) {
                    // Save no answer metric
                    saveRagMetric(IndicatorValues.NO_ANSWER)

                    // Switch to no answer story if configured
                    if (!ragConfig.noAnswerStoryId.isNullOrBlank()) {
                        logger.info { "The RAG response is equal to the configured no-answer sentence, so switch to the no-answer story." }
                        getNoAnswerRAGStory(ragConfig)
                    } else null
                } else {
                    // Save success metric
                    saveRagMetric(IndicatorValues.SUCCESS)
                    null
                }
            }
        }
    }

    /**
     * Switch to the configured no-answer story if exists.
     * Switch to the default unknown story otherwise.
     * @param ragConfig: The RAG configuration
     */
    private fun BotBus.getNoAnswerRAGStory(
        ragConfig: BotRAGConfiguration
    ): StoryDefinition {
        val noAnswerStory: StoryDefinition
        val noAnswerStoryId = ragConfig.noAnswerStoryId
        if (!noAnswerStoryId.isNullOrBlank()) {
            logger.info { "A no-answer story $noAnswerStoryId is configured, so run it." }
            noAnswerStory = botDefinition.findStoryDefinitionById(noAnswerStoryId, applicationId).let {
                // Prevent infinite loop when the noAnswerStory is removed or disabled
                if (it.id == RAGStoryDefinition.RAG_STORY_NAME) {
                    logger.info { "The no-answer story is removed or disabled, so run the default unknown story." }
                    botDefinition.unknownStory
                } else it
            }
        } else {
            logger.info { "No no-answer story is configured, so run the default unknown story." }
            noAnswerStory = botDefinition.unknownStory
        }

        return noAnswerStory
    }

    /**
     * Call RAG API
     * @param botBus
     *
     * @return RAG response if it needs to be handled, null otherwise (already handled by a switch for instance in case of no response)
     */
    private fun rag(botBus: BotBus): Triple<TextWithFootnotes?, Any?, StoryDefinition?> {
        logger.info { "Call Generative AI Orchestrator - RAG API" }
        with(botBus) {

            val ragConfiguration = botDefinition.ragConfiguration!!

            try {
                val response = ragService.rag(
                    query = RAGQuery(
                        history = getDialogHistory(dialog),
                        questionAnsweringLlmSetting = ragConfiguration.llmSetting,
                        questionAnsweringPromptInputs = mapOf(
                            "question" to action.toString(),
                            "locale" to userPreferences.locale.displayLanguage,
                            "no_answer" to ragConfiguration.noAnswerSentence
                        ),
                        embeddingQuestionEmSetting = ragConfiguration.emSetting,
                        documentIndexName = OpenSearchUtils.normalizeDocumentIndexName(
                            ragConfiguration.namespace, ragConfiguration.botId
                        ),
                        documentSearchParams = OpenSearchParams(
                            // The number of neighbors to return for each query_embedding.
                            k = kNeighborsDocuments, filter = listOf(
                                Term(term = mapOf("metadata.index_session_id.keyword" to ragConfiguration.indexSessionId!!))
                            )
                        ),
                    ), debug = connectorData.metadata["debugEnabled"].toBoolean() || ragDebugEnabled
                )

                // Handle RAG response
                return Triple(response?.answer, response?.debug, ragStoryRedirection(this, response))
            } catch (exc: Exception) {
                logger.error { exc }
                // Save failure metric
                saveRagMetric(IndicatorValues.FAILURE)

                return if (exc is GenAIOrchestratorBusinessError && exc.error.info.error == "APITimeoutError") {
                    logger.info { "The APITimeoutError is raised, so switch to the no-answer story." }
                    Triple(null, null, getNoAnswerRAGStory(ragConfiguration))
                } else Triple(TextWithFootnotes(text = technicalErrorMessage), exc, null)
            }
        }
    }

    /**
     * Create a dialog history (Human and Bot message)
     * @param dialog
     */
    private fun getDialogHistory(dialog: Dialog): List<ChatMessage> = dialog.stories.flatMap { it.actions }.mapNotNull {
            when (it) {
                is SendSentence -> if (it.text == null) null
                else ChatMessage(
                    text = it.text.toString(), type = if (PlayerType.user == it.playerId.type) ChatMessageType.HUMAN
                    else ChatMessageType.AI
                )

                is SendSentenceWithFootnotes -> ChatMessage(
                    text = it.text.toString(), type = ChatMessageType.AI
                )

                // Other types of action are not considered part of history.
                else -> null
            }
        }
        // drop the last message, because it corresponds to the user's current question
        .dropLast(n = 1)
        // take last 10 messages
        .takeLast(n = nLastMessages)

    private fun BotBus.saveRagMetric(indicator: IndicatorValues) {
        BotRepository.saveMetric(
            createMetric(
                MetricType.QUESTION_REPLIED, Indicators.GEN_AI_RAG.value.name, indicator.value.name
            )
        )
    }
}