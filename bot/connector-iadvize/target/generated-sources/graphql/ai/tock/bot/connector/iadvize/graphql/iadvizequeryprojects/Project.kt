package ai.tock.bot.connector.iadvize.graphql.iadvizequeryprojects

import ai.tock.bot.connector.iadvize.graphql.LegacyId
import com.expediagroup.graphql.client.Generated
import kotlin.String

@Generated
public data class Project(
  /**
   * Project unique id
   */
  public val id: LegacyId,
  /**
   * Project name
   */
  public val name: String,
)
