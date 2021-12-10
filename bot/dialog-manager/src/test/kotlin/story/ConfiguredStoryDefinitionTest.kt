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

package ai.tock.dialogManager.story

import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.dialogManager.config.BotDefinitionWrapper
import ai.tock.dialogManager.config.ConfiguredStoryDefinition
import ai.tock.dialogManager.story.TestStoryDefinition.story_with_other_starter
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ConfiguredStoryDefinitionTest {

    @Test
    fun `starterIntents returns builtin starter intents`() {
        val botDefinition = BotDefinitionTest()
        val wrapper = BotDefinitionWrapper(botDefinition)
        val story = ConfiguredStoryDefinition(
            wrapper,
            StoryDefinitionConfiguration(
                wrapper,
                story_with_other_starter,
                null
            )
        )
        assertEquals(setOf(story_with_other_starter.mainIntent(), secondaryIntent), story.starterIntents)
    }
}
