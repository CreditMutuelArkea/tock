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

package ai.tock.shared.vertx.graphql

/**
 * GraphQL result that can be a succeeded or failed result
 *
 * Result is succeeded when the request is sent successfully, no matter the response status code
 *
 * Result is failed when the request fail to be sent
 *
 * A succeeded result can be OK or KO
 *
 * OK is when the status code is like 2XX, otherwise the result is KO
 */
sealed class GraphQLVertxResult<T>
sealed class SucceededResult<T> : GraphQLVertxResult<T>()
data class OK<T>(val data: T?) : SucceededResult<T>()
data class KO<T>(val statusCode: Int): SucceededResult<T>()
data class FailedResult<T>(val error: Throwable): GraphQLVertxResult<T>()