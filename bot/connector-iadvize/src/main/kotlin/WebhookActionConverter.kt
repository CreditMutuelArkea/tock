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

package ai.tock.bot.connector.iadvize

import ai.tock.bot.connector.iadvize.model.request.IadvizeRequest
import ai.tock.bot.connector.iadvize.model.request.MessageRequest
import ai.tock.bot.connector.iadvize.model.request.TransferRequest
import ai.tock.bot.engine.action.SendSentence
import ai.tock.bot.engine.event.Event
import ai.tock.bot.engine.event.NoInputEvent
import ai.tock.bot.engine.event.PassThreadControlEvent
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.engine.user.PlayerType
import mu.KotlinLogging

/**
 *
 */
internal object WebhookActionConverter {

    private val logger = KotlinLogging.logger {}

    fun toEvent(
        request: IadvizeRequest,
        applicationId: String
    ): Event {
        val playerId = PlayerId(request.idConversation, PlayerType.user)
        val recipientId = PlayerId(request.idConversation, PlayerType.bot)

        return when (request) {
            is MessageRequest ->
                SendSentence(
                    playerId,
                    applicationId,
                    recipientId,
                    request.message.payload.value
                )

            is TransferRequest -> PassThreadControlEvent(playerId, recipientId, request.idOperator, applicationId)
            else -> NoInputEvent(
                playerId,
                recipientId,
                applicationId
            ).also { logger.warn("Cannot parse the type of event encountered : $request") }
        }
    }
}
