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

package ai.tock.bot.connector.iadvize.graphql.models

import com.expediagroup.graphql.client.types.GraphQLClientRequest
import com.fasterxml.jackson.annotation.JsonProperty
import kotlin.String
import kotlin.reflect.KClass

const val ROUTING_RULE: String =
    "query RoutingRule(${'$'}id: UUID!) {\n    routingRule(id: ${'$'}id) {\n        availability {\n            chat {\n                isAvailable\n            }\n        }\n    }\n}"

class RoutingRule(override val variables: Variables) : GraphQLClientRequest<RoutingRule.Result> {
  override val query: String = ROUTING_RULE
  override val operationName: String = "RoutingRule"
  override fun responseType(): KClass<Result> = Result::class

  data class Variables(val id: UUID)

  data class Result(
    /**
     * Look up a routing rule given its identifier.
     */
    @JsonProperty("routingRule")
    val routingRule: ai.tock.bot.connector.iadvize.graphql.models.routingrule.RoutingRule? = null,
  )
}
