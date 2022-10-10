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
