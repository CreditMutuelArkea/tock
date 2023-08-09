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

package ai.tock.bot.engine.config.rag

import ai.tock.bot.admin.answer.RagAnswerConfiguration
import ai.tock.bot.admin.story.StoryDefinitionAnswersContainer
import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.config.rag.client.RagServiceApiClient
import ai.tock.bot.engine.config.rag.client.dto.RagQuery
import mu.KotlinLogging

/**
 * Handler of a rag story answer
 */
object RagAnswerHandler {

    private val logger = KotlinLogging.logger {}

    internal fun handle(
        botBus: BotBus,
        container: StoryDefinitionAnswersContainer,
        configuration: RagAnswerConfiguration,
//        redirectFn : (String) -> Unit,
    ) {
        with(botBus) {
//            val story = container as StoryDefinitionConfiguration
//            val intentName = botBus.currentIntent?.intentWithoutNamespace()?.name!!
//            val storyId = story._id.toString()
            //code de story au final // on laisse ici?
            if(botBus.botDefinition.ragConfigurationEnabled){

                if(!userText.isNullOrEmpty()) {
                    try {
                        RagServiceApiClient().ask(RagQuery(userText.toString(), applicationId, userId.id))
                    }catch (e: Throwable ){
                        logger.error { "An error occurred when trying to establish contact the rag api client ${e.message}" }
                        throw ServerErrorException(e.message.toString())
                    }
                } else {
                    throw EmptyQueryException("user text is null or empty")
                }

                //call API python
                // décaler dans un autre module probablement avec un provider pour être sûr de rien faire sinon answers unknown même si actif.
                // send au user le résultat
                // attention latence d'appel et gestion des erreurs

                //configuration unknown -> renvoi vers unknown story et entraînement ?
            } else {
                botBus.handleAndSwitchStory(botBus.botDefinition.unknownStory)
            }

        }
//            val intentName = botBus.currentIntent?.intentWithoutNamespace()?.name!!
//
//            val storyId = story._id.toString()
//            val endingStoryRuleExists = story.findEnabledEndWithStoryId(applicationId) != null
//
//            // Get a stored tick state. Start a new session if it doesn't exist
//            val tickSession = initTickSession(dialog, storyId, connectorData.conversationData)
//
//            // Call the tick story processor
//            val processingResult =
//                TickStoryProcessor(
//                    tickSession,
//                    configuration.toTickConfiguration(),
//                    TickSenderBotBus(botBus),
//                    endingStoryRuleExists
//                ).process(
//                    TickUserAction(
//                        intentName,
//                        parseEntities(entities, tickSession.initDate))
//                )
//
//            // update tick state dialog
//            updateDialog(dialog, storyId, processingResult.session)
//
//            // Redirect to new story if processingResult is Redirect
//            if(processingResult is Redirect) redirectFn(processingResult.storyId)
//        }
    }

//    /**
//     * If action is final, then remove a given tick story from a Dialog
//     * else update a tick state
//     */
//    private fun updateDialog(dialog: Dialog, storyId: String, tickSession: TickSession) {
//        logger.debug { "updating dialog tick state with session data... " }
//        dialog.tickStates[storyId] =
//            with(tickSession) {
//                TickState(
//                    currentState!!,
//                    contexts,
//                    ranHandlers,
//                    objectivesStack,
//                    initDate,
//                    unknownHandlingStep,
//                    handlingStep,
//                    finished
//                )
//            }
//    }

//    /**
//     * Initialize a tick session
//     */
//    fun initRagSession(dialog: Dialog, storyId: String, conversationData: Map<String, String>): TickSession {
//        val tickState = dialog.tickStates[storyId]
//        return with(tickState) {
//            if (this == null || finished) {
//                logger.debug { "start a new session... " }
//                TickSession(initDate = dialog.lastDateUpdate, contexts = conversationData)
//            } else {
//                logger.debug { "continue the session already started..." }
//                var sessionCtx = contexts
//                conversationData.forEach { (t, u) ->
//                    if (!contexts.containsKey(t))
//                        sessionCtx = contexts + (t to u)
//                }
//                TickSession(currentState, sessionCtx, ranHandlers, objectivesStack, initDate, unknownHandlingStep, lastExecutedAction)
//            }
//        }
//    }
//    /**
//     * Feed the contexts with the [entities][Map<String, EntityStateValue>] provided from the initialization date
//     */
//    private fun parseEntities(entities: Map<String, EntityStateValue>, initDate: Instant): Map<String, String?> {
//        return entities
//            .filterValues { it.lastUpdate.isAfter(initDate) }
//            .mapValues { it.value.value?.content }
//    }
}