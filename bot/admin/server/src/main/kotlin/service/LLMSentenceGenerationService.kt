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

import ai.tock.bot.admin.BotAdminService
import ai.tock.bot.admin.bot.LLMSentenceGenerationConfigurationDAO
import ai.tock.bot.admin.bot.llm.LLMSentenceGenerationConfiguration
import ai.tock.bot.admin.bot.llm.LLMSentenceGenerationValidationService
import ai.tock.bot.admin.model.LLMSentenceGenerationConfigurationDTO
import ai.tock.shared.exception.rest.BadRequestException
import ai.tock.shared.injector
import ai.tock.shared.provide
import ai.tock.shared.vertx.WebVerticle
import com.mongodb.MongoWriteException
import mu.KLogger
import mu.KotlinLogging

/**
 * Service that manage the LLM Sentences Generation with Large Language Model (LLM) functionality
 */
object LLMSentenceGenerationService {

    private val logger: KLogger = KotlinLogging.logger {}
    private val llmSentenceGenerationConfigurationDAO: LLMSentenceGenerationConfigurationDAO get() = injector.provide()

    /**
     * Get the LLM Sentence Generation configuration
     */
    fun getLLMSentenceGenerationConfiguration(namespace: String, botId: String): LLMSentenceGenerationConfiguration? {
        return llmSentenceGenerationConfigurationDAO.findByNamespaceAndBotId(namespace, botId)
    }

    /**
     * Save LLMSentenceGeneration configuration and filter errors
     * @param llmSentenceGenerationConfig : the llm sentence generation configuration to create or update
     * @throws [BadRequestException] if a llm sentence generation configuration is invalid
     * @return [LLMSentenceGenerationConfiguration]
     */
    fun saveLLMSentenceGeneration(
        llmSentenceGenerationConfig: LLMSentenceGenerationConfigurationDTO
    ): LLMSentenceGenerationConfiguration {
        BotAdminService.getBotConfigurationsByNamespaceAndBotId(llmSentenceGenerationConfig.namespace, llmSentenceGenerationConfig.botId).firstOrNull()
            ?: WebVerticle.badRequest("No bot configuration is defined yet [namespace: ${llmSentenceGenerationConfig.namespace}, botId = ${llmSentenceGenerationConfig.botId}]")
        return saveLLMSentenceGenerationConfiguration(llmSentenceGenerationConfig)
    }

    /**
     * Save the LLM Sentence Generation configuration
     * @param llmSentenceGenerationConfiguration [LLMSentenceGenerationConfigurationDTO]
     */
    private fun saveLLMSentenceGenerationConfiguration(
        llmSentenceGenerationConfiguration: LLMSentenceGenerationConfigurationDTO
    ): LLMSentenceGenerationConfiguration {
        val llmSentenceGenerationConfig = llmSentenceGenerationConfiguration.toLLMSentenceGenerationConfiguration()

        // Check validity of the rag configuration
        LLMSentenceGenerationValidationService.validate(llmSentenceGenerationConfig).let { errors ->
            if(errors.isNotEmpty()) {
                throw BadRequestException(errors)
            }
        }

        return try {


            llmSentenceGenerationConfigurationDAO.save(llmSentenceGenerationConfig)
        } catch (e: MongoWriteException) {
            throw BadRequestException(e.message ?: "Rag Configuration: registration failed on mongo ")
        } catch (e: Exception) {
            throw BadRequestException(e.message ?: "Rag Configuration: registration failed ")
        }
    }


}
