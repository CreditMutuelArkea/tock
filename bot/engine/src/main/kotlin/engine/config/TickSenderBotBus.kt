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

package ai.tock.bot.engine.config

import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.message.ActionWrappedMessage
import ai.tock.bot.sender.TickSender
import ai.tock.translator.I18nLabelValue
import ai.tock.translator.Translator

/**
 * A bot bus tick sender, it uses a BotBus to send messages
 */
class TickSenderBotBus(private val botBus: BotBus): TickSender {

    override fun sendById(id: String, end: Boolean) {
            when(val label = Translator.getLabel(id)){
            null -> throw IllegalStateException("Label $id not found")
            else -> {
                val message = ActionWrappedMessage(
                    SendSentence(
                        botBus.botId,
                        botBus.applicationId,
                        botBus.userId,
                        botBus.translate(I18nLabelValue(label))), 0)
                if (end) {
                    botBus.end(message, 0)
                } else {
                    botBus.send(message, 0)
                }
            }
        }
    }

    override fun sendPlainText(text: String, end: Boolean) {
            if(end) botBus.end(text) else botBus.send(text)
    }

}