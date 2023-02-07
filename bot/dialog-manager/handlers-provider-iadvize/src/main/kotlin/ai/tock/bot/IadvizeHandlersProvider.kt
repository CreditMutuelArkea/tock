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

package ai.tock.bot

import ai.tock.bot.handler.ActionHandler
import ai.tock.bot.handler.ActionHandlersProvider
import ai.tock.iadvize.client.graphql.IadvizeGraphQLClient
import ai.tock.iadvize.client.graphql.models.customData.CustomDatas


const val HANDLER_ID = "check_client_connected"
const val CONVERSATION_ID = "CONVERSATION_ID"
const val CLIENT_CONNECTED = "CLIENT_CONNECTED"
const val CLIENT_DISCONNECTED = "CLIENT_DISCONNECTED"

private const val DESCRIPTION = "Check if the client is connected or not"

/**
 * The [IadvizeHandlersProvider] is a set of handlers that call iadvize api in order to set some related contexts
 */
class IadvizeHandlersProvider : ActionHandlersProvider {

    private val iadvizeGraphQLClient = IadvizeGraphQLClient()

    override fun getNameSpace() = HandlerNamespace.IADVIZE

    override fun getActionHandlers(): Set<ActionHandler> = setOf(
        createActionHandler(
            id = HANDLER_ID,
            description = DESCRIPTION,
            inputContexts = setOf(CONVERSATION_ID),
            outputContexts = setOf(CLIENT_CONNECTED, CLIENT_DISCONNECTED),
            handler = {
                with(mutableMapOf<String, String?>()) {
                    it[CONVERSATION_ID]?.let { conversationId ->
                        iadvizeGraphQLClient.isCustomDataExist(conversationId, CustomDatas.CHAT_ENABLED).let { connected ->
                            if (connected) put(CLIENT_CONNECTED, null)
                            else put(CLIENT_DISCONNECTED, null)
                        }
                    }
                    this
                }
            }
        )
    )
}