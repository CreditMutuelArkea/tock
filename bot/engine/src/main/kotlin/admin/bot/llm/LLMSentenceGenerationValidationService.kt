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
import ai.tock.bot.admin.bot.llm.settings.azureopenai.AzureOpenAILLMSetting
import ai.tock.bot.admin.bot.llm.settings.azureopenai.AzureOpenAIVersion
import ai.tock.bot.admin.requests.LLMProviderSettingStatusQuery
import ai.tock.bot.admin.bot.llm.settings.openai.OpenAILLMSetting
import ai.tock.bot.admin.bot.llm.settings.openai.OpenAILanguageModel
import ai.tock.bot.admin.service.LLMProviderService
import ai.tock.shared.exception.error.ErrorMessage
import ai.tock.shared.injector
import ai.tock.shared.provide
import com.hubspot.jinjava.Jinjava
import java.util.HashMap
object LLMSentenceGenerationValidationService {

    private val llmProviderService: LLMProviderService get() = injector.provide()
    // TODO MASS : improve the validation. Workshop ?
    fun validate(llmSentenceGenerationConfig: LLMSentenceGenerationConfiguration): Set<String> =
        validateLLMSetting(llmSentenceGenerationConfig.llmSetting)

    private fun validateLLMSetting(setting: LLMSetting): Set<String> {
        return when(setting){
            is OpenAILLMSetting -> validateOpenAILLMSetting(setting)
            is AzureOpenAILLMSetting -> validateAzureOpenAILLMSetting(setting)
            else -> setOf("Unknown LLM setting")
        }
    }



    private fun validateOpenAILLMSetting(setting: OpenAILLMSetting): Set<String> =
        validate(setting)

    private fun validateAzureOpenAILLMSetting(setting: AzureOpenAILLMSetting): Set<String> {
        val errors = mutableSetOf<String>()

        errors.addAll(validate(setting))

        AzureOpenAIVersion.findByVersion(setting.apiVersion)
            ?: errors.add("Unknown API version : ${setting.apiVersion}")

        return errors
    }

    private fun validate(setting: LLMSetting): Set<String> {
        val errors = mutableSetOf<String>()
        val jinjava = Jinjava()

        if(setting.apiKey.isBlank()) {
            errors.add("The API key is not provided")
        }

        OpenAILanguageModel.findById(setting.model)
            ?: errors.add("Unknown model : ${setting.model}")

        if (setting.temperature.isBlank()) {
            errors.add("The temperature is not provided")
        } else if (setting.temperature.toDouble() !in 0.0..1.0) {
            errors.add("The temperature is not correct [0..1]")
        }



        val context = HashMap<String, Any>()

        context["LOCAL"] = "French-FR"
        context["NB_SENTENCES"] = "5 phraseS de TesTEs"

        val renderedTemplate = jinjava.render(setting.prompt, context)
        if (setting.prompt.isBlank()) {
            errors.add("The prompt is not provided")
        } else {
            if (! renderedTemplate.contains("French-FR")){
                errors.add("No LOCAL variable in the template " )
            }
            if ( ! renderedTemplate.contains("5 phraseS de TesTE")){
                errors.add("No NB_SENTENCES variable in the template " )
            }
        }

       errors.addAll( llmProviderService
                            .checkSetting(LLMProviderSettingStatusQuery(setting))
                            .getErrors("LLM setting check failed")
            )


        return errors
    }

}