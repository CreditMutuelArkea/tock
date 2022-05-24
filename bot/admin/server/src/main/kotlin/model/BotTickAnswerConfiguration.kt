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

package ai.tock.bot.admin.model

import ai.tock.bot.admin.answer.AnswerConfigurationType
import ai.tock.bot.admin.answer.BuiltInAnswerConfiguration
import ai.tock.bot.admin.answer.SimpleAnswer
import ai.tock.bot.admin.answer.TickAnswerConfiguration
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentWithoutNamespace
import ai.tock.translator.I18nLabelValue

data class BotTickAnswerConfiguration(val otherStarterIntents: Set<IntentWithoutNamespace> = emptySet(),
                                      val secondaryIntents: Set<IntentWithoutNamespace> = emptySet(),
                                      val webhookURL: String,
                                      val stateMachine: String?)
    : BotAnswerConfiguration(AnswerConfigurationType.tick) {

    constructor(conf: TickAnswerConfiguration)
            : this(conf.otherStarterIntents, conf.secondaryIntents, conf.webhookURL, conf.stateMachine)

    fun toConfiguration(): TickAnswerConfiguration =
        TickAnswerConfiguration(otherStarterIntents, secondaryIntents, webhookURL, stateMachine)
}
