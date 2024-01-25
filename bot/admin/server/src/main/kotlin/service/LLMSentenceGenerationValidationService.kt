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

import ai.tock.bot.admin.bot.llmSentenceGeneration.LLMSentenceGenerationConfiguration
import ai.tock.llm.orchestrator.client.responses.ProviderSettingStatusResponse
import ai.tock.llm.orchestrator.client.services.LLMProviderService
import ai.tock.llm.orchestrator.client.requests.LLMProviderSettingStatusQuery
import ai.tock.shared.exception.error.ErrorMessage
import ai.tock.shared.injector
import ai.tock.shared.provide
object LLMSentenceGenerationValidationService {

    private val llmProviderService: LLMProviderService get() = injector.provide()


    fun validate(llmSentenceGenerationConfig: LLMSentenceGenerationConfiguration): Set<ErrorMessage> {
        return mutableSetOf<ErrorMessage>().apply {
            addAll(
                llmProviderService
                    .checkSetting( LLMProviderSettingStatusQuery(llmSentenceGenerationConfig.llmSetting))
                    .getErrors("LLM setting check failed")
            )

            addAll(validateIndexSessionId(llmSentenceGenerationConfig))
        }
    }

    private fun validateIndexSessionId(llmSentenceGenerationConfig: LLMSentenceGenerationConfiguration): Set<ErrorMessage> {
        val errors = mutableSetOf<ErrorMessage>()
        if (llmSentenceGenerationConfig.enabled && llmSentenceGenerationConfig.indexSessionId.isNullOrBlank()) {
            errors.add(
                ErrorMessage(
                    message = "The index session ID is required to enable the RAG feature"
                )
            )
        }
        return errors
    }

    private fun ProviderSettingStatusResponse?.getErrors(message: String): Set<ErrorMessage> =
        this?.errors?.map { ErrorMessage(message = message, params = errors) }?.toSet() ?: emptySet()

}