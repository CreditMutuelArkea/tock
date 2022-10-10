package ai.tock.bot.connector.iadvize.graphql.routingrule

import com.expediagroup.graphql.client.Generated

/**
 * Contains all channel's availabilities for the RoutingRule. Each field is a channel
 */
@Generated
public data class RoutingRuleAvailability(
  public val chat: RoutingRuleChannelAvailability,
)
