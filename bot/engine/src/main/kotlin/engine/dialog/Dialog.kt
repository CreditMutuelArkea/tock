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

import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.user.PlayerId
import ai.tock.bot.engine.user.UserTimelineDAO
import ai.tock.shared.injector
import ai.tock.shared.provide
import org.litote.kmongo.Id
import org.litote.kmongo.newId

/**
 * A dialog is a conversation between users and bots.
 * Conversation history is split into a list of [stories].
 * The dialog has a (current) [state].
 */
data class Dialog(
    /**
     * The players of the dialog.
     */
    override val playerIds: Set<PlayerId>,
    /**
     * The id of the dialog.
     */
    var id: Id<Dialog> = newId(),
    /**
     * The state of the dialog.
     */
    override val state: DialogState = DialogState(),
    /**
     * The history of stories in the dialog.
     */
    override val scripts: MutableList<Story> = mutableListOf(),
    /**
     * An optional group identifier.
     */
    override val groupId: String? = null,
) : DialogT<Story> {

    companion object {
        /**
         * Init a new dialog from the specified dialog.
         */
        fun initFromDialog(dialog: Dialog): Dialog {
            return Dialog(
                dialog.playerIds,
                state = DialogState.initFromDialogState(dialog.state),
                scripts = listOfNotNull(
                    dialog.scripts.lastOrNull()?.run {
                        val s = copy()
                        s.actions.clear()
                        if (actions.isNotEmpty()) {
                            s.actions.addAll(actions.takeLast(5))
                        }
                        s
                    }
                ).toMutableList()
            )
        }
    }

    /**
     * The [Snapshots] of the dialog.
     */
    override val snapshots: List<Snapshot> by lazy { injector.provide<UserTimelineDAO>().getSnapshots(id) }

    override fun initFromDialog(dialog: DialogT<Story>): DialogT<Story> {
        return Dialog.initFromDialog(dialog as Dialog)
    }

}
