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
import ai.tock.translator.I18nLabelValue

/**
 * Base implementation of [BotDefinition].
 */
open class BotDefinitionBase(
    override val botId: String,
    override val namespace: String,
    val scriptManager: ScriptManager,
    override val nlpModelName: String = botId,
    override val eventListener: EventListener = EventListenerBase(),
    override val flowDefinition: DialogFlowDefinition? = null,
) : BotDefinition {

    override fun getRealScriptManager(): ScriptManager = scriptManager

    /**
     * Constructor intended to be used by an enum.
     */
    constructor(botId: String, scriptManager: ScriptManager) :
            this(botId, botId, scriptManager)

    /**
     * The default unknown answer.
     */
    override val defaultUnknownAnswer: I18nLabelValue get() = i18n("Sorry, I didn't understand :(")

    override fun toString(): String {
        return botId
    }
}
