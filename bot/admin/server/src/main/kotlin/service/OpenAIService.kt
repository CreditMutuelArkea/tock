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

package ai.tock.bot.admin.service

import OpenAI
import ai.tock.bot.admin.model.openai.CompletionRequest
import ai.tock.bot.admin.model.openai.CompletionResponse
import ai.tock.bot.admin.model.openai.CompletionValidation
import ai.tock.shared.exception.rest.BadRequestException
import core.completion.Choice
import core.completion.completionRequest
import core.model.ModelId
import kotlinx.coroutines.runBlocking
import mu.KLogger
import mu.KotlinLogging

object OpenAIService {

    private val logger: KLogger = KotlinLogging.logger {}

    private val openAI = OpenAI(
        requireNotNull(
            System.getProperty("OPENAI_API_KEY") ?: System.getenv("OPENAI_API_KEY")) {
                "OPENAI_API_KEY environment variable must be set."
            }
    )

    fun generationSentences(
        request: CompletionRequest
    ): CompletionResponse? {
        val errors = CompletionValidation.validateRequest(request)

        return if(errors.isEmpty()) {
            runBlocking {
                try {
                    val completion = openAI.completion(completionRequest {
                        model = ModelId(request.config?.modelId ?: "text-davinci-003")
                        prompt = request.data.prompt()
                        maxTokens = request.config?.maxTokens ?: 2048
                        temperature = request.config?.temperature ?: 1.0
                        bestOf = 1
                        echo = false
                    })

                    CompletionResponse(completion.choices.flatMap { parseResult(it) })
                } catch (e: Exception) {
                    logger.error { e }
                    throw BadRequestException(setOf(e.cause?.message.toString()))
                }
            }

        } else {
            throw BadRequestException(errors)
        }
    }

    private fun parseResult(choice: Choice): List<String> {
        val numberingRegex = Regex("\n[0-9]+. ")
        return choice.text
            .split(numberingRegex)
            .map { r -> r.replace(numberingRegex, "").trim() }
            .filter { r -> !r.isNullOrBlank() }
    }

}