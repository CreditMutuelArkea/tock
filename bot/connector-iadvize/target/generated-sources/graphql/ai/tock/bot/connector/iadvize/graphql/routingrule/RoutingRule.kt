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

/**
 * Routing rules determine how to distribute conversations from a set of targeting rules to a set of
 * routing groups, according to a routing mode.
 */
@Generated
public data class RoutingRule(
  /**
   * Channel availabilities for the RoutingRule.
   * Note that due to performance limitations, only one `availability` field can be resolved by
   * query,
   * which means listing RoutingRules while requiring availability will cause empty field with
   * error.
   */
  public val availability: RoutingRuleAvailability? = null,
)
