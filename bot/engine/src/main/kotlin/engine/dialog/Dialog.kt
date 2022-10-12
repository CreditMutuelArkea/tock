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
import java.time.Instant
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
    val playerIds: Set<PlayerId>,
    /**
     * The id of the dialog.
     */
    var id: Id<Dialog> = newId(),
    /**
     * The state of the dialog.
     */
    val state: DialogState = DialogState(),
    /**
     * The history of stories in the dialog.
     */
    val stories: MutableList<Story> = mutableListOf(),
    /**
     * An optional group identifier.
     */
    val groupId: String? = null,

    // TODO MASS : Experimental. à mettre dans DialogState ?
    // TODO : suggestion de david  -> il faudrait peut être faire une surcharge de dialog, pour faire des "TickDialog" ?
    val tickStates: MutableMap<String, TickState> = mutableMapOf()
) {

    companion object {
        /**
         * Init a new dialog from the specified dialog.
         */
        fun initFromDialog(dialog: Dialog): Dialog {
            return Dialog(
                dialog.playerIds,
                state = DialogState.initFromDialogState(dialog.state),
                stories = listOfNotNull(
                    dialog.stories.lastOrNull()?.run {
                        val s = copy()
                        s.actions.clear()
                        if (actions.isNotEmpty()) {
                            s.actions.addAll(actions.takeLast(5))
                        }
                        s
                    }
                ).toMutableList(),
                tickStates = dialog.tickStates
//            // TODO MASS
//                David :
//                j'ai l'impression que ce comportement est un peu trop spécifique au dev qui est fait ici. d'un point de vu expérimental, je comprend l'idée, mais un dialog est un objet générique.
//                si on commence à avoir des éléments vide qui ne sont remplie que lorsqu'on utilise tock d'une certaine manière, ça risque de fortement nuire à la maintenabilité du code.
//                Je n'ai pas de solution alternative à proposer à la place, il faudrait y réfléchir.
            )
        }
    }

    /**
     * The last update date.
     */
    val lastDateUpdate: Instant get() = lastAction?.date ?: Instant.now()

    /**
     * The current story if any.
     */
    val currentStory: Story? get() = stories.lastOrNull()

    /**
     * All old actions.
     */
    fun allActions(): List<Action> = stories.flatMap { it.actions }

    /**
     * Returns last action.
     */
    val lastAction: Action? get() = stories.lastOrNull { it.lastAction != null }?.lastAction

    /**
     * Returns last user action.
     */
    val lastUserAction: Action? = stories.lastOrNull { it.lastUserAction != null }?.lastUserAction

    /**
     * The [Snapshots] of the dialog.
     */
    val snapshots: List<Snapshot> by lazy { injector.provide<UserTimelineDAO>().getSnapshots(id) }

    /**
     * Current number of actions in dialog history.
     */
    val actionsSize: Int get() = stories.sumBy { it.actions.size }

}
