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

import com.expediagroup.graphql.client.types.GraphQLClientRequest
import io.vertx.core.Vertx
import io.vertx.ext.web.client.HttpRequest
import io.vertx.ext.web.client.WebClient
import io.vertx.ext.web.client.WebClientOptions
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.ReceiveChannel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import java.util.regex.Pattern

private const val GRAPHQL_ENDPOINT = "/graphql"
data class GraphQLVertxClient(val vertx: Vertx, val url: GraphQLVertxUrl)  {

    private val logger = KotlinLogging.logger { }
    private val serializer: GraphQLVertxSerializer = GraphQLVertxSerializer()
    private val options = WebClientOptions()
        .setSsl(url.ssl)
        .setTrustAll(true)
        .setDefaultPort(url.port)
        .setDefaultHost(url.baseUrl)
        .setUserAgent(WebClientOptions.loadUserAgent())

    private val client: WebClient = WebClient.create(vertx, options)

    suspend fun <T : Any> execute(
        request: GraphQLClientRequest<T>,
        requestCustomizer: HttpRequest<*>.() -> Unit,
        responseHandler: suspend (GraphQLVertxResult<T>) -> Unit,
    ) = coroutineScope {
        client
            .post(GRAPHQL_ENDPOINT)
            .apply { requestCustomizer.invoke(this) }
            .sendJson(serializer.serialize(request)) {
                runBlocking {
                    if (it.succeeded()) {
                        with(it.result()) {
                            with(statusCode()) {
                                if (isSuccess()) {
                                    responseHandler(OK(serializer.deserialize(bodyAsString(), request.responseType()).data))
                                } else {
                                    responseHandler(KO(this))
                                }
                            }
                        }
                    } else {
                        responseHandler(FailedResult(it.cause()))
                    }
                }
            }
    }

    suspend fun <T : Any> execute(
        request: GraphQLClientRequest<T>,
        requestCustomizer: HttpRequest<*>.() -> Unit
    ): ReceiveChannel<GraphQLVertxResult<T>> = with( Channel<GraphQLVertxResult<T>>()) {
        execute(request, requestCustomizer){ send(it) }
        this
    }
}

fun Int.isSuccess() : Boolean {
    val regex = Pattern.compile("^2\\d{2}")
    return regex.matcher("$this").matches()
}