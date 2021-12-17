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

import ai.tock.bot.story.dialogManager.StoryDefinition

interface ScriptManagerStory : ScriptManager {

    /**
     * The list of each stories.
     */
    val stories: List<StoryDefinition>

    /**
     * The unknown story. Used where no valid intent is found.
     */
    val unknownStory: StoryDefinition

    /**
     * To handle keywords - used to bypass nlp.
     */
    val keywordStory: StoryDefinition

    /**
     * The hello story. Used for first interaction with no other input.
     */
    val helloStory: StoryDefinition?

    /**
     * Provides default Story when no context is known - default to [helloStory] or first [stories].
     */
    val defaultStory: StoryDefinition
        get() = helloStory ?: stories.first()

    /**
     * The goodbye story. Used when closing the conversation.
     */
    val goodbyeStory: StoryDefinition?

    /**
     * The no input story. When user does nothing!
     */
    val noInputStory: StoryDefinition?

    /**
     * The story that handles [ai.tock.bot.engine.action.SendLocation] action. If it's null, current intent is used.
     */
    val userLocationStory: StoryDefinition?

    /**
     * The story that handles [ai.tock.bot.engine.action.SendAttachment] action. If it's null, current intent is used.
     */
    val handleAttachmentStory: StoryDefinition?

    /**
     * To manage deactivation.
     */
    @Deprecated("use botDisabledStories list")
    val botDisabledStory: StoryDefinition?

    /**
     * List of deactivation stories.
     */
    val botDisabledStories: List<StoryDefinition>
        get() = emptyList()

    /**
     * To manage reactivation.
     */
    @Deprecated("use botEnabledStories list")
    val botEnabledStory: StoryDefinition?

    /**
     * List of reactivation stories.
     */
    val botEnabledStories: List<StoryDefinition>
        get() = emptyList()

}