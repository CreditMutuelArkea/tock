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

package ai.tock.bot.admin.bot.llm.settings.azureopenai

import ai.tock.bot.admin.bot.llm.settings.LLMProvider
import ai.tock.bot.admin.bot.llm.settings.LLMSetting

data class AzureOpenAISetting(
    override val apiKey: String,
    override val model: String,
    override val temperature: String? = null,
    override val prompt: String? = null,
    val deploymentName: String,
    val privateEndpointBaseUrl: String,
    val apiVersion: String,
) : LLMSetting(LLMProvider.AzureOpenAIService, apiKey, model, temperature, prompt)