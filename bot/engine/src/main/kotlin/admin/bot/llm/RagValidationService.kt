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

package ai.tock.bot.admin.bot.llm


import ai.tock.bot.admin.bot.llm.settings.LLMSetting
import ai.tock.bot.admin.bot.llm.settings.azureopenai.AzureOpenAISetting
import ai.tock.bot.admin.bot.llm.settings.azureopenai.AzureOpenAIVersion
import ai.tock.bot.admin.bot.llm.settings.openai.OpenAIModel
import ai.tock.bot.admin.bot.llm.settings.openai.OpenAISetting

object RagValidationService {

    // TODO MASS : improve the validation. Workshop ?
    fun validate(ragConfig: BotRAGConfiguration): Set<String> =
        validateLLMSetting(ragConfig.llmSetting) + validateLLMSetting(ragConfig.llmSettingEmbedding, true)

    private fun validateLLMSetting(setting: LLMSetting, isForEmbedding: Boolean = false): Set<String> {
        return when(setting){
            is OpenAISetting -> validateOpenAISetting(setting, isForEmbedding)
            is AzureOpenAISetting -> validateAzureOpenAISetting(setting, isForEmbedding)
            else -> setOf("Unknown LLM setting")
        }
    }


    private fun validateOpenAISetting(setting: OpenAISetting, isForEmbedding: Boolean = false): Set<String> =
        validate(setting, isForEmbedding)


    private fun validateAzureOpenAISetting(setting: AzureOpenAISetting, isForEmbedding: Boolean = false): Set<String> {
        val errors = mutableSetOf<String>()

        errors.addAll(validate(setting, isForEmbedding))

        AzureOpenAIVersion.findByVersion(setting.apiVersion)
            ?: errors.add("Unknown API version : ${setting.apiVersion}")

        return errors
    }

    private fun validate(setting: LLMSetting, isForEmbedding: Boolean = false): Set<String> {
        val errors = mutableSetOf<String>()

        if(setting.apiKey.isBlank()) {
            errors.add("The API key is not provided")
        }

        OpenAIModel.findById(setting.model)
            ?: errors.add("Unknown model : ${setting.model}")

        if(!isForEmbedding) {
            if (setting.temperature.isNullOrBlank()) {
                errors.add("The temperature is not provided")
            } else if (setting.temperature!!.toDouble() !in 0.0..1.0) {
                errors.add("The temperature is not correct [0..1]")
            }

            if (setting.prompt.isNullOrBlank()) {
                errors.add("The prompt is not provided")
            }
        } else{
            if (setting.temperature != null) {
                errors.add("The temperature is not allowed for embedding")
            }
            if (setting.prompt != null) {
                errors.add("The prompt is not allowed for embedding")
            }
        }

        return errors
    }
}