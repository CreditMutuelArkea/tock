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

package ai.tock.bot.engine.dialog

import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.script.Script
import org.litote.kmongo.Id
import java.time.Instant

/**
 * A dialog is a conversation between users and bots.
 * Conversation history is split into a list of [stories].
 * The dialog has a (current) [state].
 */
interface DialogT<T: Script, R: DialogT<T, R>> {
    /**
     * The players of the dialog.
     */
    val playerIds: Set<PlayerId>

    /**
     * The id of the dialog.
     */
    val id: Id<R>

    /**
     * The state of the dialog.
     */
    val state: DialogState

    /**
     * The history of stories in the dialog.
     */
    val scripts: MutableList<T>

    /**
     * An optional group identifier.
     */
    val groupId: String?

    /**
     * The last update date.
     */
    val lastDateUpdate: Instant
        get() = lastAction?.date ?: Instant.now()

    /**
     * The current script if any.
     */
    val currentScript: T?
        get() = scripts.lastOrNull()

    val currentIntent: IntentAware?
        get()= currentScript?.mainIntent

    /**
     * Returns last action.
     */
    val lastAction: Action?
        get() = scripts.lastOrNull { it.lastAction != null }?.lastAction

    /**
     * Returns last user action.
     */
    val lastUserAction: Action?
        get() = scripts.lastOrNull { it.lastUserAction != null }?.lastUserAction

    /**
     * Current number of actions in dialog history.
     */
    val actionsSize: Int
        get() = scripts.sumOf { it.actions.size }

    /**
     * The [Snapshots] of the dialog.
     */
    val snapshots: List<Snapshot>

    /**
     * All old actions.
     */
    fun allActions(): List<Action> = scripts.flatMap { it.actions }

    fun initFromDialog(dialog: DialogT<T, R>): DialogT<T, R>

}
