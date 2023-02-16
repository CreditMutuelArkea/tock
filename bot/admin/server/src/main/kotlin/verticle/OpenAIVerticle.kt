/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

package ai.tock.bot.admin.verticle

import ai.tock.bot.admin.model.openai.CompletionRequest
import ai.tock.bot.admin.model.openai.CompletionResponse
import ai.tock.bot.admin.service.OpenAIService
import ai.tock.shared.security.TockUserRole
import ai.tock.shared.vertx.WebVerticle
import io.vertx.ext.web.RoutingContext
import kotlinx.coroutines.runBlocking
import mu.KLogger
import mu.KotlinLogging

class OpenAIVerticle {

    private val logger: KLogger = KotlinLogging.logger {}

    private val generateSentencesPath    = "/openai/generate-sentences"

    /**
     * Declaration of routes and their appropriate handlers
     */
    fun configure(webVerticle: WebVerticle) {
        logger.info { "Configure OpenAI Verticle" }
        with(webVerticle) {
            blockingJsonPost(generateSentencesPath, setOf(TockUserRole.botUser), handler = generateSentences)
        }
    }

    private val generateSentences: (RoutingContext, CompletionRequest) -> CompletionResponse? =
        { _, request -> runBlocking {OpenAIService.generationSentences(request) }}
}