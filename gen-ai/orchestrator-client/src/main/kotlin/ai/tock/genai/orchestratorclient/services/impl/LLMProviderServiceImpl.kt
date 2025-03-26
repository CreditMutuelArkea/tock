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

package ai.tock.genai.orchestratorclient.services.impl

import ai.tock.genai.orchestratorclient.retrofit.GenAIOrchestratorClient
import ai.tock.genai.orchestratorclient.api.LLMProviderApi
import ai.tock.genai.orchestratorclient.requests.LLMProviderSettingStatusRequest
import ai.tock.genai.orchestratorclient.responses.ProviderSettingStatusResponse
import ai.tock.genai.orchestratorclient.services.LLMProviderService

class LLMProviderServiceImpl: LLMProviderService {
    private val retrofit = GenAIOrchestratorClient.getClient()
    private val llmProviderApi = retrofit.create(LLMProviderApi::class.java)

    override fun checkSetting(query: LLMProviderSettingStatusRequest): ProviderSettingStatusResponse? {
        val response = llmProviderApi.checkLLMSetting(query, query.setting.provider).execute()
        return response.body()
    }
}