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

package ai.tock.bot.admin.model.openai

import ai.tock.bot.handler.ActionHandlersRepository
import ai.tock.bot.statemachine.StateMachine

/**
 * The completion validation service
 */
object CompletionValidation {

    object MessageProvider {
        const val NO_SENTENCE_GIVEN = "No sentence given"
        const val INCORRECT_TEMPERATURE = "Temperature not in range [0, 1]"
        const val INCORRECT_MAX_TOKENS = "Max token not in range [0, 4000]"
        const val INCORRECT_NUMBER_OF_GENERATED_SENTENCES = "Number of sentences to generate not in range [0, 20]"

    }

    private fun validateSentences(request: CompletionRequest): Set<String> {
        val givenSentences = request.data.sentences.filter { !it.isNullOrBlank() }

        return when(givenSentences.isEmpty()){
            true -> setOf(MessageProvider.NO_SENTENCE_GIVEN)
            else -> emptySet()
        }
    }

    private fun validateTemperature(request: CompletionRequest): Set<String> {
        return validateRange(request.config?.temperature,
            0.0,
            1.0,
            MessageProvider.INCORRECT_TEMPERATURE)
    }

    private fun validateMaxToken(request: CompletionRequest): Set<String> {
        return validateRange(request.config?.maxTokens,
            0,
            4000,
            MessageProvider.INCORRECT_MAX_TOKENS)
    }

    private fun validateNumberOfGenerated(request: CompletionRequest): Set<String> {
        return validateRange(request.data.numberOfGenerated,
            0,
            20,
            MessageProvider.INCORRECT_NUMBER_OF_GENERATED_SENTENCES)
    }

    private fun validateRange(value: Double?, min: Double, max: Double, error: String): Set<String> {
        return value?.let { if(it !in min..max) setOf(error) else emptySet() } ?: emptySet()
    }

    private fun validateRange(value: Int?, min: Int, max: Int, error: String): Set<String> {
        return value?.let { if(it !in min..max) setOf(error) else emptySet() } ?: emptySet()
    }

    fun validateRequest(request: CompletionRequest): Set<String> {
        return validateSentences(request)
            .plus(validateTemperature(request))
            .plus(validateMaxToken(request))
            .plus(validateNumberOfGenerated(request))
    }
}





