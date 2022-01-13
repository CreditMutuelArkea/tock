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

package ai.tock.bot.engine.config

import ai.tock.bot.DialogManager.ScriptManager
import ai.tock.bot.DialogManager.ScriptManagerStory
import ai.tock.bot.DialogManager.ScriptManagerStoryBase
import ai.tock.bot.admin.answer.AnswerConfigurationType.builtin
import ai.tock.bot.admin.bot.BotApplicationConfigurationKey
import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.Intent.Companion.unknown
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.user.UserTimeline
import ai.tock.bot.story.config.ConfiguredStoryDefinition
import mu.KotlinLogging

/**
 *
 */
internal class BotStoryDefinitionWrapper(val botDefinition: BotDefinition) : BotDefinition by botDefinition {

    override val scriptManager: ScriptManagerStoryWrapper =
        ScriptManagerStoryWrapper(botDefinition.scriptManager as ScriptManagerStoryBase, this)

    private val logger = KotlinLogging.logger {}

    override fun toString(): String {
        return "Wrapper($botDefinition)"
    }
}