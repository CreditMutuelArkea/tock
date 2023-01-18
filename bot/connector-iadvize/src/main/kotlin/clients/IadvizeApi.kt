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

package ai.tock.bot.connector.iadvize.clients

import ai.tock.bot.connector.iadvize.clients.models.AuthResponse
import ai.tock.bot.connector.iadvize.clients.models.GraphQLResponse
import ai.tock.bot.connector.iadvize.clients.models.RoutingRule
import ai.tock.shared.retrofitBuilderWithTimeoutAndLogger
import ai.tock.shared.tokenAuthenticationInterceptor
import mu.KLogger
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.converter.jackson.JacksonConverterFactory
import retrofit2.create
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

/**
 * Iadvize API.
 * client implementation used to make REST and GRAPHQL calls to Iadvize apis.
 *
 * @author Henri-Joel SEDJAME
 */
interface IadvizeApi {
    @FormUrlEncoded
    @POST(TOKEN_ENDPOINT)
    fun createToken(@Field(USERNAME) username: String,
                    @Field(PASSWORD) password: String,
                    @Field(GRANT_TYPE) grantType: String
    ): Call<AuthResponse>

    @POST(GRAPHQL_ENDPOINT)
    fun checkAvailability(@Body body: RequestBody) : Call<GraphQLResponse<RoutingRule.Result>>

}

fun createApi(logger: KLogger): IadvizeApi = retrofitBuilderWithTimeoutAndLogger(30000, logger)
        .baseUrl(BASE_URL)
        .addConverterFactory(JacksonConverterFactory.create())
        .build()
        .create()

fun createSecuredApi(logger: KLogger, tokenProvider: () -> String): IadvizeApi = retrofitBuilderWithTimeoutAndLogger(30000, logger,
    interceptors = listOf(tokenAuthenticationInterceptor(tokenProvider)))
    .baseUrl(BASE_URL)
    .addConverterFactory(JacksonConverterFactory.create())
    .build()
    .create()
