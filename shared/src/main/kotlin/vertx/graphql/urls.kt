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

private const val HTTPS_PORT = 443
private const val HTTP = "http"
private const val HTTPS = "https"

sealed class GraphQLVertxUrl(open val baseUrl: String, open val port: Int, val ssl: Boolean)
data class SecuredUrl(override val baseUrl: String) : GraphQLVertxUrl(baseUrl.replace("$HTTPS://", ""), HTTPS_PORT,  true) {
    init {
        require(baseUrl.startsWith("$HTTPS://") || !baseUrl.contains("$HTTPS://"))
    }
}
data class UnSecuredUrl(override val baseUrl: String, override val port: Int) : GraphQLVertxUrl(baseUrl.replace("$HTTP://", ""), port, false) {
    init {
        require(baseUrl.startsWith("$HTTP://") || !baseUrl.contains("$HTTP://"))
    }
}
