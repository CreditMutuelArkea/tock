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

package ai.tock.bot.connector.iadvize.graphql.routingrule

import com.expediagroup.graphql.client.Generated
import kotlin.Boolean

/**
 * Contains availability for a Channel for a RoutingRule. See fields for more details.
 */
@Generated
public data class RoutingRuleChannelAvailability(
  /**
   * A RoutingRule's channel is available if it has at least one operator online and available
   */
  public val isAvailable: Boolean,
)
