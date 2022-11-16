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

package ai.tock.bot.api.service

import ai.tock.bot.admin.bot.BotConfiguration
import ai.tock.bot.api.model.UserRequest
import ai.tock.bot.api.model.configuration.ClientConfiguration
import ai.tock.bot.api.model.websocket.RequestData
import ai.tock.bot.api.model.websocket.ResponseData
import ai.tock.bot.engine.WebSocketController
import ai.tock.shared.error
import ai.tock.shared.jackson.mapper
import ai.tock.shared.longProperty
import com.fasterxml.jackson.module.kotlin.readValue
import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit.SECONDS
import mu.KotlinLogging

private val timeoutInSeconds: Long = longProperty("tock_api_timout_in_s", 10)

private class WSHolder(
    @Volatile
    private var response: ResponseData? = null,
    private val latch: CountDownLatch = CountDownLatch(1)
) {

    fun receive(response: ResponseData) {
        this.response = response
        latch.countDown()
    }

    fun wait(): ResponseData? {
        latch.await(timeoutInSeconds, SECONDS)
        return response
    }
}

private val wsRepository: Cache<String, WSHolder> =
    CacheBuilder.newBuilder().expireAfterWrite(timeoutInSeconds + 1, SECONDS).build()

internal class BotApiClientController(
    private val provider: BotApiDefinitionProvider,
    configuration: BotConfiguration
) {

    private val logger = KotlinLogging.logger {}

    private val apiKey: String = configuration.apiKey
    private val webhookUrl: String? = configuration.webhookUrl

    private val client = webhookUrl?.takeUnless { it.isBlank() }?.let {
        try {
            BotApiClient(it)
        } catch (e: Exception) {
            logger.error(e)
            null
        }
    }

    init {
        if (WebSocketController.websocketEnabled) {
            logger.debug { "register $apiKey" }
            WebSocketController.registerAuthorizedKey(apiKey)
            WebSocketController.setReceiveHandler(apiKey) { content: String ->
                try {
                    val response: ResponseData? = mapper.readValue(content)
                    if (response != null) {
                        val conf = response.botConfiguration
                        if (conf == null) {
                            val holder = wsRepository.getIfPresent(response.requestId)
                            if (holder == null) {
                                logger.warn { "unknown request ${response.requestId}" }
                            }
                            holder?.receive(response)
                        } else {
                            provider.updateIfConfigurationChange(conf)
                        }
                    } else {
                        logger.warn { "null response: $content" }
                    }
                } catch (e: Exception) {
                    logger.error(e)
                }
            }
        }
    }

    fun configuration(): ClientConfiguration? =
        client?.send(RequestData(configuration = true))?.botConfiguration
            ?: sendWithWebSocket(RequestData(configuration = true))?.botConfiguration

    fun send(userRequest: UserRequest): ResponseData? {
        val request = RequestData(userRequest)
        return if (client != null) {
            client.send(request.copy(request.botRequest))
        } else {
            sendWithWebSocket(request) ?: error("no webhook set and no response from websocket")
        }
    }

    private fun sendWithWebSocket(request: RequestData): ResponseData? {
        val pushHandler = WebSocketController.getPushHandler(apiKey)
        return if (pushHandler != null) {
            val holder = WSHolder()
            wsRepository.put(request.requestId, holder)
            logger.debug { "send request ${request.requestId}" }
            pushHandler.invoke(mapper.writeValueAsString(request))
            holder.wait()
        } else {
            null
        }
    }
}
