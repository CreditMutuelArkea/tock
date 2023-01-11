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

package clients.graphql

import ai.tock.bot.connector.iadvize.clients.DataNotFoundError
import ai.tock.bot.connector.iadvize.clients.IadvizeApi
import ai.tock.bot.connector.iadvize.clients.NotSuccessResponseError
import ai.tock.bot.connector.iadvize.clients.graphql.IadvizeGraphQLClient
import ai.tock.bot.connector.iadvize.clients.models.GraphQLResponse
import ai.tock.bot.connector.iadvize.clients.models.RoutingRule
import ai.tock.bot.connector.iadvize.clients.models.routingrule.RoutingRuleAvailability
import ai.tock.bot.connector.iadvize.clients.models.routingrule.RoutingRuleChannelAvailability
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*
import retrofit2.Response

class IadvizeGraphQLClientTest {

    private val response: Response<GraphQLResponse<RoutingRule.Result>> = mockk(relaxed = true)
    private val  api : IadvizeApi = mockk(relaxed = true)
    private val client = IadvizeGraphQLClient()
    @BeforeEach
    fun setUp() {
        every { api.checkAvailability(any()).execute() } returns response

        every { response.isSuccessful } returns true

        every { response.body() } returns GraphQLResponse(RoutingRule.Result(ai.tock.bot.connector.iadvize.clients.models.routingrule.RoutingRule(
            RoutingRuleAvailability(RoutingRuleChannelAvailability(true))
        )))

        client.iadvizeApi = api
    }


    @Test
    fun `check availability`() {

        val available = client.available("")

        assertTrue(available)
    }

    @Test
    fun `check availability with an unsuccessful api response`() {

        every { response.isSuccessful } returns false

        assertThrows(NotSuccessResponseError::class.java) {
            client.available("")
        }

    }


    @Test
    fun `check availability with a null api response`() {

        every { response.body() } returns null

        assertThrows(DataNotFoundError::class.java) {
            client.available("")
        }

    }


}