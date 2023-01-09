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
import ai.tock.shared.property
import ai.tock.shared.vertx.graphql.*

import ai.tock.shared.vertx.vertx



class IadvizeGraphQLClient  {

    private val client: GraphQLVertxClient = GraphQLVertxClient(vertx, SecuredUrl(property(IADVIZE_GRAPHQL_BASE_URL, DEFAULT_BASE_URL)))
    private val authenticationClient = IadvizeAuthenticationClient()

    companion object {
        const val IADVIZE_GRAPHQL_BASE_URL = "tock_iadvize_grapql_baseurl"
        const val DEFAULT_BASE_URL = "api.iadvize.com"
        const val CONTENT_TYPE = "content-type"
        const val APPLICATION_JSON = "application/json"
        const val AUTHORIZATION = "Authorization"
        const val BEARER = "Bearer"
    }

    suspend fun isRuleAvailable(distributionRule: String): Boolean =
        /* Start by creating an access token */
        authenticationClient.getAccessToken().let { jwt ->
            /*
            With the Iadvize ID retrived from the env variable,
            build the Routuing rule request
            */
           RoutingRule(RoutingRule.Variables(distributionRule))
                .let {
                    /*
                    Then perform the graphQl request.
                    !! Do not forget to enhance the request headers !!
                    * */
                    client.execute(it) {
                        putHeader(CONTENT_TYPE, APPLICATION_JSON)
                        putHeader(AUTHORIZATION, "$BEARER $jwt")
                    }
                }.let { channel ->
                    with(channel.receive().body()) {
                        when (this) {
                            is SucceededResult -> {
                                when (this) {
                                    is OK -> data?.routingRule?.availability?.chat?.isAvailable ?: dataNotFoundError()
                                    is KO -> notSuccessResponseError(statusCode)
                                }
                            }

                            is FailedResult -> requestFailedError(error.message)
                        }
                    }
               }

        }
}
