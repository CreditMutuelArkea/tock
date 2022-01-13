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

package ai.tock.bot.engine.user

import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.dialog.Story

/**
 * The user timeline - all dialogs and data of the user.
 */
class UserTimeline(
    /**
     * The user id.
     */
    override val playerId: PlayerId,
    /**
     * User data, first name, email, etc.
     */
    override val userPreferences: UserPreferences = UserPreferences(),
    /**
     * The user state, with simple flags.
     */
    override val userState: UserState = UserState(),
    /**
     * The dialogs of the timeline.
     */
    override val dialogs: MutableList<Dialog> = mutableListOf(),
    /**
     * Temporary ids (of type [PlayerType.temporary] linked to this user timeline.
     */
    override val temporaryIds: MutableSet<String> = mutableSetOf()
) : UserTimelineT<Dialog> {

    /**
     * Returns the current story.
     */
    val currentStory: Story?
        get() = currentDialog?.currentScript

    override fun toString(): String {
        return "UserTimeline(playerId=$playerId)"
    }
}
