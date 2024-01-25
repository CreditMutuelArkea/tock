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

package ai.tock.bot.admin.model

import ai.tock.bot.admin.bot.llmSentenceGeneration.LLMSentenceGenerationConfiguration
import ai.tock.llm.orchestrator.core.models.llm.LLMSetting
import org.litote.kmongo.newId
import org.litote.kmongo.toId

data class LLMSentenceGenerationConfigurationDTO(
    val id: String? = null,
    val namespace: String,
    val botId: String,
    val indexSessionId: String? = null,
    val enabled: Boolean = false,
    val llmSetting: LLMSetting,
) {
    constructor(configuration: LLMSentenceGenerationConfiguration): this(
        configuration._id.toString(),
        configuration.namespace,
        configuration.botId,
        configuration.indexSessionId,
        configuration.enabled,
        configuration.llmSetting,
    )
    fun toLLMSentenceGenerationConfiguration(): LLMSentenceGenerationConfiguration =
        LLMSentenceGenerationConfiguration(
            id?.toId() ?: newId(),
            namespace,
            botId,
            indexSessionId = indexSessionId,
            enabled,
            llmSetting
        )
}



