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

import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.dialog.DialogT
import ai.tock.bot.engine.user.UserTimeline
import ai.tock.bot.engine.user.UserTimelineT

class DialogManagerFactory {

    companion object {
        fun createDialogManager(
            botDefinition: BotDefinition,
            userTimeline: UserTimelineT<*>,
            action: Action
        ): DialogManager<DialogT<*, *>> {
            //if(botDefinition.type == Type.STORY)
            return if(userTimeline is UserTimeline) {
                DialogManagerStory(userTimeline, action) as DialogManager<DialogT<*, *>>
            } else {
                error("can't create dialog manager")
            }
        }
    }


}