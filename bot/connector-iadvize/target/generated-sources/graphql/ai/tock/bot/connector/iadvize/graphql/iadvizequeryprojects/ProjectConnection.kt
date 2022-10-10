package ai.tock.bot.connector.iadvize.graphql.iadvizequeryprojects

import com.expediagroup.graphql.client.Generated
import kotlin.collections.List

/**
 * A connection to a list of items.
 */
@Generated
public data class ProjectConnection(
  /**
   * A list of edges.
   */
  public val edges: List<ProjectEdge?>? = null,
)
