
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

import ai.tock.bot.connector.ConnectorType
import ai.tock.bot.connector.iadvize.model.response.conversation.QuickReply
import ai.tock.bot.connector.iadvize.model.response.conversation.payload.TextPayload
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeMessage
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeReply
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeTransfer
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeTransfer.TransferOptions
import ai.tock.bot.connector.iadvize.model.response.conversation.Duration
import ai.tock.bot.engine.Bus

internal const val IADVIZE_CONNECTOR_TYPE_ID = "iadvize"

/**
 * The iAdvize connector type.
 */
internal val iadvizeConnectorType = ConnectorType(IADVIZE_CONNECTOR_TYPE_ID)

internal fun <T : Bus<T>> T.withIadvize(messageProvider: () -> IadvizeReply): T {
    return withMessage(iadvizeConnectorType, messageProvider)
}

/**
 * Creates a iAdvize quickreply sentence
 */
internal fun <T : Bus<T>> T.iadvizeQuickReply(
    title: CharSequence
): QuickReply = QuickReply(translate(title).toString())


/**
 * Creates a iAdvize transfer
 */
internal fun <T : Bus<T>> T.iadvizeTransfer(
    timeoutSeconds: Long
): IadvizeTransfer = IadvizeTransfer("", TransferOptions(Duration(timeoutSeconds, Duration.TimeUnit.seconds)) )

/**
 * Creates a iAdvize quickreply sentence
 */
internal fun <T : Bus<T>> T.iadvizeTransfer(
    timeout: Long,
    unit: Duration.TimeUnit
): IadvizeTransfer = IadvizeTransfer("", TransferOptions(Duration(timeout, unit)) )


/**
 * Creates a iAdvize message sentence
 */
internal fun <T : Bus<T>> T.iadvizeMessage(
    title: CharSequence
): IadvizeReply = IadvizeMessage(translate(title).toString())

/**
 * Creates a iAdvize message with quickreplies sentence
 */
internal fun <T : Bus<T>> T.iadvizeMessage(
    title: CharSequence,
    quickReplies: MutableList<QuickReply>
): IadvizeReply = IadvizeMessage(TextPayload(translate(title).toString()), quickReplies)