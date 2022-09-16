
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
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.IadvizeTransfer.TransferOptions
import ai.tock.bot.connector.iadvize.model.response.conversation.Duration
import ai.tock.bot.connector.iadvize.model.response.conversation.reply.*
import ai.tock.bot.engine.Bus

val millis: Duration.TimeUnit = Duration.TimeUnit.millis
val seconds: Duration.TimeUnit = Duration.TimeUnit.seconds
val minutes: Duration.TimeUnit = Duration.TimeUnit.minutes

internal const val IADVIZE_CONNECTOR_TYPE_ID = "iadvize"

/**
 * The iAdvize connector type.
 */
internal val iadvizeConnectorType = ConnectorType(IADVIZE_CONNECTOR_TYPE_ID)

fun <T : Bus<T>> T.withIadvize(messageProvider: () -> IadvizeReply): T {
    return withMessage(iadvizeConnectorType, messageProvider)
}

/**
 * Creates a iAdvize multipart replies sentence
 */
fun <T : Bus<T>> T.iadvizeMultipartReplies(
    vararg replies : IadvizeReply
): IadvizeMultipartReply = IadvizeMultipartReply(replies.toList())

/**
 * Creates a iAdvize quickreply sentence
 */
fun <T : Bus<T>> T.iadvizeQuickReply(
    title: CharSequence
): QuickReply = QuickReply(translate(title).toString())

/**
 * Creates a iAdvize instant transfer
 */
fun <T : Bus<T>> T.iadvizeTransfer(): IadvizeTransfer = IadvizeTransfer(0)

/**
 * Creates a iAdvize transfer
 */
fun <T : Bus<T>> T.iadvizeTransfer(
    timeoutSeconds: Long
): IadvizeTransfer = IadvizeTransfer(timeoutSeconds)

/**
 * Creates a iAdvize quickreply sentence
 */
fun <T : Bus<T>> T.iadvizeTransfer(
    timeout: Long,
    unit: Duration.TimeUnit
): IadvizeTransfer = IadvizeTransfer(Duration(timeout, unit))

/**
 * Creates a iAdvize message sentence
 */
fun <T : Bus<T>> T.iadvizeMessage(
    title: CharSequence
): IadvizeMessage = IadvizeMessage(translate(title).toString())

/**
 * Creates a iAdvize message with quickreplies sentence
 */
fun <T : Bus<T>> T.iadvizeMessage(
    title: CharSequence,
    vararg quickReplies: QuickReply
): IadvizeMessage = IadvizeMessage(TextPayload(translate(title).toString()), quickReplies.toMutableList())


/**
 * Creates a iAdvize await
 */
fun <T : Bus<T>> T.iadvizeAwait(
    timeout: Long,
    unit: Duration.TimeUnit
): IadvizeAwait = IadvizeAwait(Duration(timeout, unit))

/**
 * Creates a iAdvize await
 */
fun <T : Bus<T>> T.iadvizeClose(
): IadvizeClose = IadvizeClose()
