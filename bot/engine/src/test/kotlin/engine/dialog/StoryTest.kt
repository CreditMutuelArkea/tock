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

import ai.tock.bot.definition.Intent
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.bot.engine.user.UserTimeline
import io.mockk.every
import io.mockk.mockk
import kotlin.test.Test
import kotlin.test.assertEquals

class StoryTest {

    private val storyDefinition: StoryDefinition = mockk()
    private val userTimeline: UserTimeline = mockk()
    private val dialog: Dialog = mockk()
    private val action: Action = mockk()

    private val story = Story(
        storyDefinition,
        Intent("starter"),
    )

    private val newIntent = Intent("new")

    @Test
    fun `multi-entities action triggers the step tree`() {
        val secondLevelStep: SimpleStoryStep = mockk {
            every { name } returns "second level"
            every { children } returns emptySet()
            every { selectFromAction(any(), any(), any(), newIntent) } returns true
        }
        val firstLevelStep: SimpleStoryStep = mockk {
            every { children } returns setOf(secondLevelStep)
            every { name } returns "first level"
            every { selectFromAction(any(), any(), any(), newIntent) } returns true
        }

        every { storyDefinition.steps } returns setOf(firstLevelStep)

        story.computeCurrentStep(userTimeline, dialog, action, newIntent)

        assertEquals(secondLevelStep.name, story.step)
    }
}
