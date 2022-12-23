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


import com.expediagroup.graphql.client.serializer.defaultGraphQLSerializer
import com.expediagroup.graphql.client.types.GraphQLClientRequest
import com.expediagroup.graphql.client.types.GraphQLClientResponse
import io.vertx.core.Vertx
import io.vertx.core.json.Json
import io.vertx.ext.web.client.HttpRequest
import io.vertx.ext.web.client.WebClient
import io.vertx.ext.web.client.WebClientOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import java.util.regex.Pattern
import kotlin.reflect.KClass

private const val GRAPHQL_ENDPOINT = "/graphql"
private const val HTTPS_PORT = 443

class GraphQLVertxSerializer {

    private val serializer = defaultGraphQLSerializer()
    fun <T:Any>deserialize(rawResponse: String, responseType: KClass<T>): GraphQLClientResponse<T> =
        serializer.deserialize(rawResponse, responseType)

    fun serialize(request: GraphQLClientRequest<*>): Map<*, *> =
        Json.decodeValue(serializer.serialize(request), Map::class.java)
}

sealed class GraphQLVertxResult<T>
sealed class SucceedResult<T> : GraphQLVertxResult<T>()
data class OK<T>(val data: T?) : SucceedResult<T>()
data class KO<T>(val statusCode: Int): SucceedResult<T>()
data class FailedResult<T>(val error: Throwable): GraphQLVertxResult<T>()

sealed class GraphQLVertxUrl(open val baseUrl: String, open val port: Int,  val ssl: Boolean)
data class SecuredUrl(override val baseUrl: String) : GraphQLVertxUrl(baseUrl, HTTPS_PORT,  true)
data class UnSecuredUrl(override val baseUrl: String, override val port: Int) : GraphQLVertxUrl(baseUrl, port, false)

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
    ): ReceiveChannel<GraphQLVertxResult<T>>  = with( Channel<GraphQLVertxResult<T>>()) {
        execute(request, requestCustomizer){
            send(it)
        }
        this
    }
}

fun Int.isSuccess() : Boolean {
    val regex = Pattern.compile("^2\\d{2}")
    return regex.matcher("$this").matches()
}