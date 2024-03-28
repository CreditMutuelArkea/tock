/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

package ai.tock.iadvize.client.authentication

import ai.tock.iadvize.client.IadvizeApi
import ai.tock.iadvize.client.PASSWORD
import ai.tock.iadvize.client.authentication.credentials.EnvCredentialsProvider
import ai.tock.iadvize.client.authenticationFailedError
import ai.tock.iadvize.client.createApi
import ai.tock.shared.injector
import ai.tock.shared.provide
import ai.tock.shared.security.credentials.CredentialsProvider
import mu.KotlinLogging
import java.time.LocalDateTime
import java.util.concurrent.atomic.AtomicReference


/**
 * Authentication client.
 */
class IadvizeAuthenticationClient {

    companion object {
        val logger = KotlinLogging.logger { }
        val token = AtomicReference<Token?>()
        const val DELAY_SECONDS = 5
    }

    private val credentialsProvider: CredentialsProvider = injector.provide()

    internal var iadvizeApi: IadvizeApi = createApi(logger)

    private val username: String by lazy {
        credentialsProvider.getCredentials().username
    }

    private val password: String by lazy {
        credentialsProvider.getCredentials().password
    }

    /**
     * Get the stored access token.
     * if the access token is expired, a new one is requested and stored.
     */
    fun getAccessToken() : String {

        var t = token.get()

        if (t == null || (t.expireAt?.isBefore(LocalDateTime.now()) == true)) {
            t = getToken()
        }

        return t.value
    }

    /**
     * Request a new access token.
     */
    private fun getToken(): Token {
        return iadvizeApi.createToken(username, password, grantType = PASSWORD).execute().body()
            ?.let {
                val value = it.accessToken ?: authenticationFailedError()
                val time = it.expiresIn?.let { s -> LocalDateTime.now().plusSeconds(s.toLong() - DELAY_SECONDS) }

                Token(value, time).also { t -> token.set(t) }
            }
            ?: authenticationFailedError()
    }

    /**
     * Stored Token representation.
     */
    data class Token(val value: String, val expireAt: LocalDateTime?)
}