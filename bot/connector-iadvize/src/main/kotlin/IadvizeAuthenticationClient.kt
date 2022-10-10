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

package ai.tock.bot.connector.iadvize

import ai.tock.shared.property
import ai.tock.shared.retrofitBuilderWithTimeoutAndLogger
import mu.KotlinLogging
import retrofit2.Call
import retrofit2.create
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

class IadvizeAuthenticationClient {

    private val logger = KotlinLogging.logger { }

    private val BASE_URL = "https://api.iadvize.com"
    private val AUTHENTICATION_PATERN = "username=%s&password=%s&grant_type=password"
    private val IADVIZE_USERNAME_AUTHENTICATION = "iadvize_username_authentication"
    private val IADVIZE_PASSWORD_AUTHENTICATION = "iadvize_password_authentication"

    private val iadvizeAuthenticationApi: IadvizeAuthenticationApi
    private val authenticationBody: String

    interface IadvizeAuthenticationApi {
        @Headers("Content-Type: application/x-www-form-urlencoded")
        @POST("/oauth2/token")
        fun createToken(@Body authentication: String): Call<String>
    }

    init {
        iadvizeAuthenticationApi = retrofitBuilderWithTimeoutAndLogger(30000, logger)
            .baseUrl(BASE_URL)
            .build()
            .create()
        authenticationBody = AUTHENTICATION_PATERN.format(
            property(IADVIZE_USERNAME_AUTHENTICATION, ""),
            property(IADVIZE_PASSWORD_AUTHENTICATION, "")
        )
    }

    fun createToken(): String {
        //TODO corriger l'exception par une autre plus spécifique et plus approprié
        return iadvizeAuthenticationApi.createToken(authenticationBody).execute().body() ?: throw Exception("no token")
    }
}