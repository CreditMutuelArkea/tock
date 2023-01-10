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

package ai.tock.bot.connector.iadvize.clients.graphql

import ai.tock.bot.connector.iadvize.clients.*
import ai.tock.bot.connector.iadvize.clients.authentication.IadvizeAuthenticationClient
import ai.tock.bot.connector.iadvize.clients.models.RoutingRule
import com.expediagroup.graphql.client.serializer.defaultGraphQLSerializer
import mu.KotlinLogging
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class IadvizeGraphQLClient {
    companion object {
        private val authenticationClient = IadvizeAuthenticationClient()
        val logger = KotlinLogging.logger { }
    }

    private val iadvizeApi: IadvizeApi = createSecuredApi(logger){
        authenticationClient.getAccessToken()
    }

    fun available(distributionRule: String): Boolean = RoutingRule(RoutingRule.Variables(distributionRule))
        .let { rule ->
            iadvizeApi.checkAvailability(
                defaultGraphQLSerializer().serialize(rule)
                    .toRequestBody(APPLICATION_JSON.toMediaTypeOrNull())
            )
                .execute()
                .let {
                    if (it.isSuccessful)
                        it.body()?.data?.routingRule?.availability?.chat?.isAvailable
                    else graphQlNotSuccessResponseError(it.code())
                } ?: graphQlDataNotFoundError()
        }
}
