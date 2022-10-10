package ai.tock.bot.connector.iadvize.graphql

import ai.tock.bot.connector.iadvize.graphql.iadvizequeryprojects.ProjectConnection
import com.expediagroup.graphql.client.Generated
import com.expediagroup.graphql.client.types.GraphQLClientRequest
import kotlin.String
import kotlin.reflect.KClass

public const val IADVIZE_QUERY_PROJECTS: String =
    "query {\n    projects {\n        edges {\n            node {\n                id\n                name\n            }\n        }\n    }\n}"

@Generated
public class IadvizeQueryProjects : GraphQLClientRequest<IadvizeQueryProjects.Result> {
  public override val query: String = IADVIZE_QUERY_PROJECTS

  public override fun responseType(): KClass<IadvizeQueryProjects.Result> =
      IadvizeQueryProjects.Result::class

  @Generated
  public data class Result(
    /**
     * List the projects
     */
    public val projects: ProjectConnection? = null,
  )
}
