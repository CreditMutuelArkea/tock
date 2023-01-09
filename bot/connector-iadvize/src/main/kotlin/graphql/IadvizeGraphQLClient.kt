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

package ai.tock.bot.connector.iadvize.graphql

import ai.tock.bot.connector.iadvize.IadvizeAuthenticationClient
import ai.tock.bot.connector.iadvize.graphql.models.RoutingRule
import ai.tock.shared.retrofitBuilderWithTimeoutAndLogger
import ai.tock.shared.tokenAuthenticationInterceptor
import com.expediagroup.graphql.client.serializer.defaultGraphQLSerializer
import com.fasterxml.jackson.annotation.JsonProperty
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Call
import retrofit2.converter.jackson.JacksonConverterFactory
import retrofit2.create
import retrofit2.http.Body
import retrofit2.http.POST


class IadvizeGraphQLClient  {

    data class GraphQLResponse<T> (@JsonProperty("data") val data: T)
    interface IadvizeGraphQLApi {
        @POST("/graphql")
        fun checkAvailability(@Body body:RequestBody) : Call<GraphQLResponse<RoutingRule.Result>>
    }

    companion object {
        private val authenticationClient = IadvizeAuthenticationClient()
        const val DEFAULT_BASE_URL = "https://api.iadvize.com"
        const val APPLICATION_JSON = "application/json"
    }

    private val iadvizeGraphQLApi: IadvizeGraphQLApi = retrofitBuilderWithTimeoutAndLogger(30000, IadvizeAuthenticationClient.logger,
        interceptors = listOf(tokenAuthenticationInterceptor { authenticationClient.getAccessToken() }))
        .baseUrl(DEFAULT_BASE_URL)
        .addConverterFactory(JacksonConverterFactory.create())
        .build()
        .create()

    fun available(distributionRule: String): Boolean = RoutingRule(RoutingRule.Variables(distributionRule))
            .let { rule ->
                iadvizeGraphQLApi.checkAvailability(
                    defaultGraphQLSerializer().serialize(rule).toRequestBody(APPLICATION_JSON.toMediaTypeOrNull())
                ).execute().let {
                    it.body()?.data?.routingRule?.availability?.chat?.isAvailable
                } ?: dataNotFoundError()
            }
}
