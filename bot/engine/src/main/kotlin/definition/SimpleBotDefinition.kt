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

package ai.tock.bot.definition

import ai.tock.bot.DialogManager.ScriptManager
import ai.tock.bot.engine.dialogManager.story.StoryDefinition
import ai.tock.bot.engine.dialogManager.story.handler.StoryHandlerBase

/**
 * A simple [BotDefinition].
 */
class SimpleBotDefinition(
    botId: String,
    namespace: String,
    scriptManager: ScriptManager,
    nlpModelName: String = botId,
    eventListener: EventListener = EventListenerBase(),
    conversation: DialogFlowDefinition? = null
) : BotDefinitionBase(
        botId,
        namespace,
        scriptManager,
        nlpModelName,
        eventListener,
        conversation
    ) {

    // set namespace for story handler
    init {
        val initLambda: (StoryDefinition) -> Unit = {
            (it.storyHandler as? StoryHandlerBase<*>)?.apply {
                i18nNamespace = namespace
            }
        }
        scriptManager.initNameSpace(initLambda)
    }
}
