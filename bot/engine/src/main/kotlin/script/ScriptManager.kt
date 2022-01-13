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

package ai.tock.bot.DialogManager

import ai.tock.bot.ScriptManager.ScriptStep
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.script.Script
import ai.tock.bot.script.ScriptDefinition
import ai.tock.nlp.api.client.model.dump.IntentDefinition
import engine.dialogManager.step.Step

interface ScriptManager {

    fun findMainIntent(scriptStep: ScriptStep): IntentAware?

    fun getFrontUnkowIntents(frontIntents: List<IntentDefinition>): List<IntentAware>

    fun initNameSpace(namespace: String)

    fun findIntent(intent: String, applicationId: String): IntentAware

    fun isEnableEndScript(namespace: String, botId: String, applicationId: String, scriptId: String): Boolean

    fun getHandleAttachmentIntent(): IntentAware?

    fun getUserLocationIntent(): IntentAware?

    fun findScriptDefinitionById(storyId: String, applicationId: String): ScriptDefinition

    fun isDisabledIntent(intent: IntentAware?): Boolean

    fun isEnabledIntent(intent: IntentAware?): Boolean

    fun createScript(intent: IntentAware?, applicationId: String): Script

}