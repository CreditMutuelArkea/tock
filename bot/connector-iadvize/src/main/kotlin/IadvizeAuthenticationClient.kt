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
import com.fasterxml.jackson.annotation.JsonProperty
import mu.KotlinLogging
import retrofit2.Call
import retrofit2.converter.jackson.JacksonConverterFactory
import retrofit2.create
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST
import java.time.LocalDateTime
import java.util.concurrent.atomic.AtomicReference


class IadvizeAuthenticationClient {

    companion object {
        val logger = KotlinLogging.logger { }

        const val BASE_URL = "https://api.iadvize.com"
        const val GRANT_TYPE = "password"
        const val IADVIZE_USERNAME_AUTHENTICATION = "iadvize_username_authentication"
        const val IADVIZE_PASSWORD_AUTHENTICATION = "iadvize_password_authentication"
        var token = AtomicReference<Token?>()
    }

    private val iadvizeAuthenticationApi: IadvizeAuthenticationApi = retrofitBuilderWithTimeoutAndLogger(30000, logger)
        .baseUrl(BASE_URL)
        .addConverterFactory(JacksonConverterFactory.create())
        .build()
        .create()

    private val username: String = property(IADVIZE_USERNAME_AUTHENTICATION, "")
    private val password: String = property(IADVIZE_PASSWORD_AUTHENTICATION, "")

    data class IadvizeAuthResponse(
        @JsonProperty("refresh_token")
        val refreshToken:String? = null,
        @JsonProperty("token_type")
        val tokenType: String? = null,
        @JsonProperty("access_token")
        val accessToken: String?=null,
        @JsonProperty("expires_in")
        val expiresIn: Number? = null )

    data class Token(val value: String, val expireAt: LocalDateTime?)

    interface IadvizeAuthenticationApi {

        @FormUrlEncoded
        @POST("/oauth2/token")
        fun createToken(@Field("username") username: String,
                        @Field("password") password: String,
                        @Field("grant_type") grantType: String
        ): Call<IadvizeAuthResponse>
    }

    class AuthenticationFailedError : Exception("Fail to retrieve a non null access token")

    private fun getToken(): Token {
        return iadvizeAuthenticationApi.createToken(username, password, GRANT_TYPE).execute().body()
            ?.let {
                val value = it.accessToken ?: throw AuthenticationFailedError()
                val time = it.expiresIn?.let { s -> LocalDateTime.now().plusSeconds(s.toLong()) }

                Token(value, time)
                    .also { tok ->
                        token.set(tok)
                    }
            }
            ?: throw AuthenticationFailedError()
    }

    fun getAccessToken() : String {

        var t = token.get()

        if (t == null || (t.expireAt?.isBefore(LocalDateTime.now()) == true)) {
            t = getToken()
        }

        return t.value
    }
}