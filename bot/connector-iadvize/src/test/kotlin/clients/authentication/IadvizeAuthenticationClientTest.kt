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

package clients.authentication

import ai.tock.bot.connector.iadvize.clients.AuthenticationFailedError
import ai.tock.bot.connector.iadvize.clients.IadvizeApi
import ai.tock.bot.connector.iadvize.clients.authentication.IadvizeAuthenticationClient
import ai.tock.bot.connector.iadvize.clients.models.AuthResponse
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import java.time.LocalDateTime
import java.time.Month



class IadvizeAuthenticationClientTest {

    companion object {
        const val ACCESS_TOKEN = "access token"
        const val EXPIRES_IN = 3600
    }
    private val  api : IadvizeApi = mockk(relaxed = true)
    private val client = IadvizeAuthenticationClient()


    @BeforeEach
    fun setUp() {

        every { api.createToken(any(), any(), any()).execute().body() } returns AuthResponse(accessToken = ACCESS_TOKEN, expiresIn = EXPIRES_IN)

        client.iadvizeApi = api

        mockkStatic(LocalDateTime::class)
        every { LocalDateTime.now() } returns LocalDateTime.of(2023, Month.JANUARY, 10, 10, 0 , 0)
    }

    @Test
    fun `get access token with api response null`() {

        every { api.createToken(any(), any(), any()).execute().body() } returns AuthResponse()

        assertThrows(AuthenticationFailedError::class.java) {
            client.getAccessToken()
        }

    }
    @Test
    fun `get access token at first time`() {

        val accessToken = client.getAccessToken()

        val token = IadvizeAuthenticationClient.token.get()

        assertNotNull(token)
        assertEquals(token!!.value, ACCESS_TOKEN)
        assertEquals(token.expireAt, LocalDateTime.now().plusSeconds(EXPIRES_IN.toLong() - IadvizeAuthenticationClient.DELAY_SECONDS))
        assertEquals(ACCESS_TOKEN, accessToken)

        verify(exactly = 1) { api.createToken(any(), any(), any()) }
    }

    @Test
    fun `get access token when token has already been set and is not expired yet`() {

        IadvizeAuthenticationClient.token.set(IadvizeAuthenticationClient.Token(ACCESS_TOKEN, LocalDateTime.now().minusSeconds(1000)))

        val accessToken = client.getAccessToken()

        val token = IadvizeAuthenticationClient.token.get()

        assertNotNull(token)

        assertEquals(ACCESS_TOKEN, accessToken)

        verify(exactly = 1) { api.createToken(any(), any(), any()) }
    }

    @Test
    fun `get access token when token has already been set and already expired`() {

        IadvizeAuthenticationClient.token.set(IadvizeAuthenticationClient.Token(ACCESS_TOKEN, LocalDateTime.now().plusSeconds(1000)))

        val accessToken = client.getAccessToken()

        val token = IadvizeAuthenticationClient.token.get()

        assertNotNull(token)

        assertEquals(ACCESS_TOKEN, accessToken)

        verify(exactly = 0) { api.createToken(any(), any(), any()) }
    }
}