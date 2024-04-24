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

package ai.tock.bot.admin.service

import ai.tock.bot.admin.bot.sentencegeneration.BotSentenceGenerationConfigurationDAO
import ai.tock.bot.admin.indicators.IndicatorValues
import ai.tock.bot.admin.indicators.Indicators
import ai.tock.bot.admin.indicators.metric.Metric
import ai.tock.bot.admin.indicators.metric.MetricType
import ai.tock.bot.admin.model.SentenceGenerationRequest
import ai.tock.bot.engine.BotRepository
import ai.tock.bot.engine.config.RAGAnswerHandler

import ai.tock.genai.orchestratorclient.requests.Formatter
import ai.tock.genai.orchestratorclient.requests.PromptTemplate
import ai.tock.genai.orchestratorclient.requests.SentenceGenerationQuery
import ai.tock.genai.orchestratorclient.responses.SentenceGenerationResponse
import ai.tock.genai.orchestratorclient.services.CompletionService
import ai.tock.shared.injector
import ai.tock.shared.provide
import ai.tock.shared.vertx.WebVerticle
import mu.KLogger
import mu.KotlinLogging


object CompletionService {

    private val logger: KLogger = KotlinLogging.logger {}
    private val completionService: CompletionService get() = injector.provide()
    private val sentenceGenerationConfigurationDAO: BotSentenceGenerationConfigurationDAO get() = injector.provide()

    /**
     * Generate sentences
     * @param request [SentenceGenerationRequest] : the sentence generation request
     * @param namespace [String] : the namespace
     * @param botId [String] : the bot id
     * @return [SentenceGenerationResponse]
     */
    fun generateSentences(
        request: SentenceGenerationRequest,
        namespace: String,
        botId: String
    ): SentenceGenerationResponse? {
        // Check if feature is configured
        val sentenceGenerationConfig = sentenceGenerationConfigurationDAO.findByNamespaceAndBotId(namespace, botId)
            ?: WebVerticle.badRequest("No configuration of sentence generation feature is defined yet " +
                    "[namespace: ${namespace}, botId = ${botId}]")

        // Check if feature is enabled
        if(!sentenceGenerationConfig.enabled){
            WebVerticle.badRequest("The sentence generation feature is disabled " +
                    "[namespace: ${namespace}, botId = ${botId}]")
        }

        // Get LLM Setting and override the temperature
        val llmSetting = sentenceGenerationConfig.llmSetting.copyWithTemperature(request.llmTemperature)

        // Create the inputs map
        val inputs = mapOf(
            "locale" to request.locale,
            "nb_sentences" to sentenceGenerationConfig.nbSentences,
            "sentences" to request.sentences,
            "options" to mapOf<String, Any>(
                "spelling_mistakes" to request.options.spellingMistakes,
                "sms_language" to request.options.smsLanguage,
                "abbreviated_language" to request.options.abbreviatedLanguage
            )
        )

        // Create a Jinja2 prompt template
        val prompt = PromptTemplate(
            formatter = Formatter.JINJA2.id,
            template = llmSetting.prompt,
            inputs = inputs
        )

        return try {
            // call the completion service to generate sentences
            val response = completionService
                .generateSentences(SentenceGenerationQuery(llmSetting, prompt))

            if(response!!.sentences.isEmpty()){
                // Save success metric
                saveSentenceGenerationMetric(botId, IndicatorValues.NO_ANSWER)
            }else{
                // Save success metric
                saveSentenceGenerationMetric(botId, IndicatorValues.SUCCESS)
            }

            // Return the response
            response
        } catch (exc: Exception) {
            logger.error { exc }
            // Save success metric
            saveSentenceGenerationMetric(botId, IndicatorValues.FAILURE)
            // Report error
            WebVerticle.badRequest("Technical error when calling the sentence generation feature!")
        }
    }

    private fun saveSentenceGenerationMetric(botId: String, indicatorValue: IndicatorValues) {
        BotRepository.saveMetric(
            Metric(
                type = MetricType.FEATURE_HANDLED,
                indicatorName = Indicators.GEN_AI_SENTENCE_GENERATION.value.name,
                indicatorValueName = indicatorValue.value.name,
                botId = botId
            )
        )
    }
}
