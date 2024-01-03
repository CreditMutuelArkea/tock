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

package ai.tock.llm.orchestrator.client.services.impl

import ai.tock.llm.orchestrator.client.api.EMProviderApi
import ai.tock.llm.orchestrator.client.retrofit.GenAIOrchestratorClient
import ai.tock.llm.orchestrator.client.requests.EMProviderSettingStatusQuery
import ai.tock.llm.orchestrator.client.responses.ProviderSettingStatusResponse
import ai.tock.llm.orchestrator.client.services.EMProviderService

class EMProviderServiceImpl: EMProviderService {
    private val retrofit = GenAIOrchestratorClient.getClient()
    private val emProviderApi = retrofit.create(EMProviderApi::class.java)

    override fun checkSetting(query: EMProviderSettingStatusQuery): ProviderSettingStatusResponse? {
        val response = emProviderApi.checkEMSetting(query, query.setting.provider).execute()
        return response.body()
    }
}