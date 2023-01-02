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

package ai.tock.bot.admin

import ai.tock.bot.BotIoc
import ai.tock.bot.connector.iadvize.graphql.*
import ai.tock.nlp.front.ioc.FrontIoc
import ai.tock.shared.vertx.graphql.*
import ai.tock.shared.vertx.vertx
import com.github.salomonbrys.kodein.Kodein
import kotlinx.coroutines.runBlocking

fun main() {

    startAdminServer()
}

fun startAdminServer(vararg modules: Kodein.Module) {

    runBlocking {

        val token =
            "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik5UTkRORE15TWtOR1EwUXdNVFEyTlVSRlJEVkZRak00TmpBMU9FSXlOVUU0UVRRNFFqZEVPUSJ9.eyJodHRwczovL2lhZHZpemUuY29tL2hhc1Blcm1pc3Npb25zRW5hYmxlZCI6ZmFsc2UsImh0dHBzOi8vaWFkdml6ZS5jb20vbGVnYWN5VXNlcklkIjoiMzcxMjM0IiwiaHR0cHM6Ly9pYWR2aXplLmNvbS9sZWdhY3lQbGF0Zm9ybSI6ImhhIiwiaXNzIjoiaHR0cHM6Ly9pYWR2aXplLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MzM1OWZiOTgzNWZiOTAyZWMyNTk5Y2UiLCJhdWQiOiJodHRwczovL2FwaS5ldS5pYWR2aXplLmNvbS8iLCJpYXQiOjE2NzE3MTYwMTksImV4cCI6MTY3MTgwMjQxOSwiYXpwIjoiUEs3S3JHTHR6ZnhVSHY2dmlzbXlxNnVLazNzcnhtM0ciLCJndHkiOiJwYXNzd29yZCIsInBlcm1pc3Npb25zIjpbXX0.ZRttOT3Me8rR6HQ7OQWQs4ivINMJmVAe0QouhUxxYV9l7jQawhI60s-JUgG7e0-wSiuN6YWth7srSChpj-rztZtmTh9sxGAkN9VmxIi-EeBNlaRLTFcJC24XfhaH-k2c18-NzRBxgqr8VtuRLN9qtYwu6fdI3eK3OtAuNcpXCnOFSVUt10-mwsS6pjTpaK7UEZCpQbRpfV6-MAUOLoJXBnk3RraW-GVR-PnvFwxBp4xLq4idJ4OSs_q_42ppdUdKg0RgdBrtu4atuKgAqZiNEYXUwYtY5UXTm44Adwh91MS81p3jorrbymgK8FfmTcdZah9Hpl7eeFm-res4yMl-Lg"
        GraphQLVertxClient(vertx, SecuredUrl("api.iadvize.com"))
            .execute(RoutingRule(RoutingRule.Variables("7eb4f902-e6e8-4dee-aae1-0e6bef30bdc0"))) {
                putHeader("Content-Type", "application/json")
                putHeader("Authorization", "Bearer $token")
            }.let { channel ->
                    channel.receive().let {
                        when (it) {
                            is SucceededResult -> {
                                when (it) {
                                    is OK -> {
                                        println(it.data)
                                    }

                                    is KO -> {
                                        println(it.statusCode)
                                    }

                                    else -> {}
                                }
                            }

                            is FailedResult -> {
                                println(it.error.message)
                            }

                            else -> {}
                        }
                    }
            }
    }
    // setup ioc
    //FrontIoc.setup(BotIoc.coreModules + modules.toList())
    // deploy verticle
    //vertx.deployVerticle(BotAdminVerticle())
}
