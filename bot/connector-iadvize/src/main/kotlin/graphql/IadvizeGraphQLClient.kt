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
import ai.tock.shared.property
import com.expediagroup.graphql.client.GraphQLClient
import com.expediagroup.graphql.client.serializer.defaultGraphQLSerializer
import com.expediagroup.graphql.client.spring.GraphQLWebClient
import com.expediagroup.graphql.client.types.GraphQLClientRequest
import com.expediagroup.graphql.client.types.GraphQLClientResponse
import com.fasterxml.jackson.databind.ObjectMapper
import io.vertx.core.json.Json
import io.vertx.core.json.JsonObject


class IadvizeGraphQLClient  {

    private val client: GraphQLWebClient = GraphQLWebClient(property(IADVIZE_GRAPHQL_BASE_URL, DEFAULT_BASE_URL))
    private val authenticationClient = IadvizeAuthenticationClient()

    companion object {
        const val IADVIZE_GRAPHQL_BASE_URL = "tock_iadvize_grapql_baseurl"
        const val DEFAULT_BASE_URL = "https://api.iadvize.com/graphql"
        const val CONTENT_TYPE = "content-type"
        const val APPLICATION_JSON = "application/json"
        const val AUTHORIZATION = "Authorization"
        const val BEARER = "Bearer"
    }

    suspend fun isRuleAvailable(jwtProvider: () -> String, ruleIdGetter: () -> String): Boolean =
        /* Start by creating a jwt token */
        jwtProvider.invoke().let { jwt ->
            /*
            With the Iadvize ID retrived from the env variable,
            build the Routuing rule request
            */
            RoutingRule(RoutingRule.Variables(ruleIdGetter.invoke()))
                .let {
                    /*
                    Then perform the graphQl request.
                    !! Do not forget to enhance the request headers !!
                    * */
                    client.execute(it) {
                        header(CONTENT_TYPE, APPLICATION_JSON)
                        header(AUTHORIZATION, "$BEARER $jwt")
                    }
                }.data?.routingRule?.availability?.chat?.isAvailable ?: false

        }
}

fun main() {

    Json.decodeValue(
        defaultGraphQLSerializer()
            .serialize(RoutingRule(RoutingRule.Variables("id"))),
        Map::class.java
    ).let { println(it) }

}