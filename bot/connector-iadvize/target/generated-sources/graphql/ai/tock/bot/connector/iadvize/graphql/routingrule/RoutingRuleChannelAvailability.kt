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
