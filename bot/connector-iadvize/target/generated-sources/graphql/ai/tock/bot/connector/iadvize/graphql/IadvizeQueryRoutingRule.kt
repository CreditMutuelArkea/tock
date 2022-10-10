package ai.tock.bot.connector.iadvize.graphql

import com.expediagroup.graphql.client.Generated
import com.expediagroup.graphql.client.types.GraphQLClientRequest
import kotlin.String
import kotlin.reflect.KClass

public const val ROUTING_RULE: String =
    "query RoutingRule(${'$'}id: UUID!) {\n    routingRule(id: ${'$'}id) {\n        availability {\n            chat {\n                isAvailable\n            }\n        }\n    }\n}"

@Generated
public class RoutingRule(
  public override val variables: RoutingRule.Variables,
) : GraphQLClientRequest<RoutingRule.Result> {
  public override val query: String = ROUTING_RULE

  public override val operationName: String = "RoutingRule"

  public override fun responseType(): KClass<RoutingRule.Result> = RoutingRule.Result::class

  @Generated
  public data class Variables(
    public val id: UUID,
  )

  @Generated
  public data class Result(
    /**
     * Look up a routing rule given its identifier.
     */
    public val routingRule: ai.tock.bot.connector.iadvize.graphql.routingrule.RoutingRule? = null,
  )
}
