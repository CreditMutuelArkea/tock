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

package ai.tock.bot.engine.dialogManager

import ai.tock.bot.DialogManager.ScriptManager
import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.BotBus
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.action.SendChoice
import ai.tock.bot.engine.dialog.DialogT
import ai.tock.bot.engine.dialog.EntityStateValue
import ai.tock.bot.engine.dialog.EntityValue
import ai.tock.bot.engine.dialog.NextUserActionState
import ai.tock.bot.engine.user.UserPreferences
import ai.tock.bot.engine.user.UserTimelineT
import ai.tock.bot.script.Script
import ai.tock.bot.script.ScriptDefinition
import ai.tock.nlp.api.client.model.Entity
import ai.tock.nlp.entity.Value
import ai.tock.translator.I18nLabelValue
import engine.dialogManager.step.Step
import java.time.Duration
import java.time.Instant

interface DialogManager<in T : DialogT<*,*>> {

    val userPreferences: UserPreferences

    val currentDialogId: String

    val currentScriptDefinition: ScriptDefinition?

    val entityValues: Map<String, EntityStateValue>

    var nextUserActionState: NextUserActionState?

    var currentIntent: IntentAware?

    var hasCurrentSwitchProcess: Boolean

    //TODO: pour que le NLP compile
    val userTimelineT: UserTimelineT<*>
    val dialogT: DialogT<*, *>

    val lastUserAction: Action?

    fun add(dialog: T)

    fun getCurrentStep(): Step<*>?

    fun changeCurrentStep(stepName: String?)

    fun currentScriptHasSteps(): Boolean

    fun changeState(role: String, newValue: EntityValue?)

    fun removeEntity(role: String)

    fun changeEntity(entity: Entity, newValue: Value?)

    fun removeAllEntity()

    fun resetState()

    fun <T : Any> contextValue(name: String): T?

    fun changeContext(name: String, value: Any?)

    fun cleanUserState()

    fun setProfileLoaded(loaded: Boolean)

    fun getUserStateFlag(flag: String): String?

    fun setUserStateFlag(flag: String, duration: Duration, value: String)

    fun isLastAction(action: Action): Boolean

    fun resetLastActionState()

    fun addAction(action: Action): Boolean

    fun addSupport(bus: BotBus): Double

    fun prepareNextAction(scriptManager: ScriptManager, action: Action): Script

    fun changeState(scriptManager: ScriptManager, choice: SendChoice, intent: IntentAware)

    fun markAsUnknow(provider: (UserTimelineT<*>)->Unit)

    fun switchScript(scriptDefinition: ScriptDefinition,
                     starterIntent: IntentAware = scriptDefinition.mainIntent(),
                     step: String? = null,
                     action: Action)

    fun isCurrentScriptDefinition(scriptDefinition: ScriptDefinition): Boolean

    fun i18nKey(botDefinition: BotDefinition, key: String, defaultLabel: CharSequence, vararg args: Any?): I18nLabelValue
}