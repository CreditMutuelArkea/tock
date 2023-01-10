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

package ai.tock.bot.connector.iadvize.clients.authentication

import ai.tock.bot.connector.iadvize.clients.IadvizeApi
import ai.tock.bot.connector.iadvize.clients.createApi
import ai.tock.bot.connector.iadvize.clients.IADVIZE_USERNAME_AUTHENTICATION
import ai.tock.bot.connector.iadvize.clients.IADVIZE_PASSWORD_AUTHENTICATION
import ai.tock.bot.connector.iadvize.clients.PASSWORD
import ai.tock.bot.connector.iadvize.clients.authenticationFailedError
import ai.tock.shared.property
import mu.KotlinLogging
import java.time.LocalDateTime
import java.util.concurrent.atomic.AtomicReference


class IadvizeAuthenticationClient {

    companion object {
        val logger = KotlinLogging.logger { }
        var token = AtomicReference<Token?>()
    }

    private val iadvizeApi: IadvizeApi = createApi(logger)
    private val username: String = property(IADVIZE_USERNAME_AUTHENTICATION, "")
    private val password: String = property(IADVIZE_PASSWORD_AUTHENTICATION, "")

    data class Token(val value: String, val expireAt: LocalDateTime?)

    fun getAccessToken() : String {

        var t = token.get()

        if (t == null || (t.expireAt?.isBefore(LocalDateTime.now()) == true)) {
            t = getToken()
        }

        return t.value
    }

    private fun getToken(): Token {
        return iadvizeApi.createToken(username, password, grantType = PASSWORD).execute().body()
            ?.let {
                val value = it.accessToken ?: authenticationFailedError()
                val time = it.expiresIn?.let { s -> LocalDateTime.now().plusSeconds(s.toLong()) }

                Token(value, time)
                    .also { tok ->
                        token.set(tok)
                    }
            }
            ?: authenticationFailedError()
    }
}