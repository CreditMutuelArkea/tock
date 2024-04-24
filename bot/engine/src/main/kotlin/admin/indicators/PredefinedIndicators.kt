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

package ai.tock.bot.admin.indicators

enum class Dimensions(val value: String) {
    GEN_AI("Gen AI")
}

enum class IndicatorValues(val value: IndicatorValue) {
    SUCCESS(IndicatorValue(name = "success", label = "SUCCESS")),
    FAILURE(IndicatorValue(name = "failure", label = "FAILURE")),
    NO_ANSWER(IndicatorValue(name = "no answer", label = "NO ANSWER")),
}

enum class Indicators(val value: Indicator) {
    GEN_AI_RAG(
        Indicator(
            name = "gen-ai-rag",
            label = "Gen AI - RAG",
            description = "Predefined indicator for the RAG (Gen IA Feature).",
            botId = "",
            dimensions = setOf(Dimensions.GEN_AI.value),
            values = setOf(
                IndicatorValues.SUCCESS.value, IndicatorValues.FAILURE.value, IndicatorValues.NO_ANSWER.value
            )
        )
    ),
    GEN_AI_SENTENCE_GENERATION(
        Indicator(
            name = "gen-ai-sentence-generation",
            label = "Gen AI - Sentence Generation",
            description = "Predefined indicator for the sentence generation (Gen IA Feature).",
            botId = "",
            dimensions = setOf(Dimensions.GEN_AI.value),
            values = setOf(
                IndicatorValues.SUCCESS.value, IndicatorValues.FAILURE.value, IndicatorValues.NO_ANSWER.value
            )
        )
    )
}

object PredefinedIndicators {
    val indicators = Indicators.entries.map { it.value }.toSet()
    fun has(name: String) = indicators.any { it.name.equals(name, ignoreCase = true) }
}