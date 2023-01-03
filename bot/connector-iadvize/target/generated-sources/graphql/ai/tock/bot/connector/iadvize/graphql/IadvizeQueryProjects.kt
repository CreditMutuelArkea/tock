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
