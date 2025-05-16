/*
 * Copyright (C) 2017/2025 SNCF Connect & Tech
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

package ai.tock.bot.admin.story.dump

import ai.tock.bot.admin.answer.AnswerConfiguration
import ai.tock.bot.admin.answer.AnswerConfigurationType
import ai.tock.bot.admin.answer.SimpleAnswerConfiguration

/**
 * An [AnswerConfigurationDump] with only [SimpleAnswerDump] (ie labels) answers.
 */
data class SimpleAnswerConfigurationDump(val answers: List<SimpleAnswerDump>) :
    AnswerConfigurationDump(AnswerConfigurationType.simple) {

    constructor(conf: SimpleAnswerConfiguration) : this(
        conf.answers.map { SimpleAnswerDump(it) }
    )

    override fun toAnswer(currentType: AnswerConfigurationType, controller: StoryDefinitionConfigurationDumpController): AnswerConfiguration =
        SimpleAnswerConfiguration(answers.map { it.toAnswer(controller) })
}
