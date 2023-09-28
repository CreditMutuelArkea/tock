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

package ai.tock.bot.connector

import ai.tock.bot.connector.media.MediaMessage
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.definition.StoryHandlerDefinition
import ai.tock.bot.definition.StoryStep
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.ConnectorController
import ai.tock.bot.engine.action.ActionNotificationType
import ai.tock.bot.engine.event.Event
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.engine.user.UserPreferences
import ai.tock.bot.llm.rag.core.client.models.RagResult

/**
 * A connector connects bots to users via a dedicated interface (like Messenger, Google Assistant, Slack... ).
 *
 * There is one Connector for each user front-end application.
 * See [ai.tock.bot.connector.messenger.MessengerConnector] or [ai.tock.bot.connector.ga.GAConnector] for examples of [Connector] implementations.
 */
interface Connector {

    /**
     * The type of the connector.
     */
    val connectorType: ConnectorType

    /**
     * Supported features.
     */
    val supportedFeatures: Set<ConnectorFeature> get() = emptySet()

    /**
     * Is this feature supported ?
     */
    fun hasFeature(feature: ConnectorFeature, targetConnectorType: ConnectorType): Boolean = supportedFeatures.contains(feature)

    /**
     * Registers the connector for the specified controller.
     */
    fun register(controller: ConnectorController)

    /**
     * Unregisters the connector.
     */
    fun unregister(controller: ConnectorController) {
        controller.unregisterServices()
    }

    /**
     * Send an event with this connector for the specified delay.
     *
     * @param event the event to send
     * @param callback the initial connector callback
     * @param delayInMs the optional delay
     */
    fun send(event: Event, callback: ConnectorCallback, delayInMs: Long = 0)

    fun startProactiveConversation(callback: ConnectorCallback): Boolean = false
    fun flushProactiveConversation(callback: ConnectorCallback, parameters: Map<String, String>) = run { }
    fun endProactiveConversation(callback: ConnectorCallback, parameters: Map<String, String>) = run { }

    /**
     * Sends a notification to the connector.
     * A [BotBus] is created and the corresponding story is called.
     *
     * @param controller the connector controller
     * @param recipientId the recipient identifier
     * @param intent the notification intent
     * @param step the optional step target
     * @param parameters the optional parameters
     * @param ragResult optional parameter for rag notification
     * @param notificationType notification type if any
     * @param errorListener called when a message has not been delivered
     */
    fun notify(
        controller: ConnectorController,
        recipientId: PlayerId,
        intent: IntentAware,
        step: StoryStep<out StoryHandlerDefinition>? = null,
        parameters: Map<String, String> = emptyMap(),
        ragResult: RagResult? = null,
        notificationType: ActionNotificationType?,
        errorListener: (Throwable) -> Unit = {}
    ): Unit =
        throw UnsupportedOperationException("Connector $connectorType does not support notification")


    /**
     * Format the notification Rag message when active
     * default connector without format
     * @param ragResult
     * //TODO : could be a ConnectorMessage ?
     * @return the formatted answer as a String
     */
    fun formatRagMessage(ragResult: RagResult): String {
        val linkSources =
                ragResult.sourceDocuments.joinToString(", ") {
                    "[${it.metadata.title}](${it.metadata.source})"
                }
        return ragResult.answer + "\n\n" + "Sources : $linkSources"
    }

    /**
     * if true, profile is not loaded twice, except that [refreshProfile] is called periodically.
     * if false, profile is loaded for each request.
     */
    val persistProfileLoaded: Boolean get() = true

    /**
     * Load user preferences - default implementation returns null.
     */
    fun loadProfile(callback: ConnectorCallback, userId: PlayerId): UserPreferences? = null

    /**
     * Refresh user preferences - default implementation returns null.
     * Only not null values are taken into account.
     */
    fun refreshProfile(callback: ConnectorCallback, userId: PlayerId): UserPreferences? = null

    /**
     * Returns a [ConnectorMessage] with the specified list of suggestions.
     * If the connector does not support suggestions, returns null.
     */
    fun addSuggestions(text: CharSequence, suggestions: List<CharSequence>): BotBus.() -> ConnectorMessage? = { null }

    /**
     * Updates a [ConnectorMessage] with the specified list of suggestions.
     * Default returns [message] unmodified.
     */
    fun addSuggestions(message: ConnectorMessage, suggestions: List<CharSequence>): BotBus.() -> ConnectorMessage? =
        { message }

    /**
     * Maps a [MediaMessage] into a [ConnectorMessage].
     * If [toConnectorMessage] returns an empty list, the mapping is not supported for this connector.
     * Default returns an empty list.
     */
    fun toConnectorMessage(message: MediaMessage): BotBus.() -> List<ConnectorMessage> = { emptyList() }

    /**
     * Determines if this connector can handle other connector messages.
     */
    fun canHandleMessageFor(otherConnectorType: ConnectorType): Boolean = connectorType == otherConnectorType
}
