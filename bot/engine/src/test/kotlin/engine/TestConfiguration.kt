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

package ai.tock.bot.engine

import ai.tock.bot.DialogManager.ScriptManagerStoryBase
import ai.tock.bot.definition.BotDefinitionBase
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.dialogManager.SimpleStoryDefinition
import ai.tock.bot.story.dialogManager.handler.SimpleStoryHandlerBase
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.bot.story.dialogManager.StoryDefinitionExtended
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.definition.story
import ai.tock.bot.definition.storyWithSteps
import ai.tock.translator.UserInterfaceType
import ai.tock.translator.UserInterfaceType.voiceAssistant
import ai.tock.translator.raw

val secondaryIntent = Intent("secondary")
val enableStory = story("enable") {}
val disableStory = story("disable") {}

class BotDefinitionTest :
    BotDefinitionBase(
        "test",
        "namespace",
        ScriptManagerStoryBase(
            stories = testStoryDefinitionList + otherStory + testWithoutStep + builtInStories + disableBotTaggedStory,
            unknownStory = unknown,
            enabledStory = enableStory,
            disabledStory = disableStory
        )
    )

enum class StepTest : SimpleStoryStep {
    s1,
    s2,
    s3,
    s4 {
        override val secondaryIntents: Set<IntentAware> = setOf(Intent("s4_secondary"))
    }
}

abstract class AbstractStoryHandler : SimpleStoryHandlerBase() {
    var registeredBus: BotBus? = null

    override fun action(bus: BotBus) {
        registeredBus = bus
        bus.end(this::class.simpleName!!.raw)
    }
}

class TestStoryDefinition(
    override val name: String,
    override val scriptHandler: AbstractStoryHandler,
    override val otherStarterIntents: Set<IntentAware> = emptySet(),
    override val secondaryIntents: Set<IntentAware> = emptySet(),
    override val stepsArray: Array<StepTest> = enumValues(),
    override val unsupportedUserInterface: UserInterfaceType? = null,
    override val tags: Set<StoryTag> = emptySet()
) : StoryDefinitionExtended {

    val registeredBus: BotBus? get() = scriptHandler.registeredBus

    override fun name(): String = name
}

val test = TestStoryDefinition("test", StoryHandlerTest, secondaryIntents = setOf(secondaryIntent))
val story_with_other_starter = TestStoryDefinition("story_with_other_starter", StoryHandlerTest, setOf(secondaryIntent))
val test2 = TestStoryDefinition("test2", StoryHandler2Test)
val voice_not_supported = TestStoryDefinition("voice_not_supported", StoryHandlerVoiceNotSupported, unsupportedUserInterface = voiceAssistant)
val withoutStep = TestStoryDefinition("withoutStep", StoryHandlerWithoutStep, stepsArray = emptyArray())
val unknown = TestStoryDefinition("unknown", StoryHandlerUnknown)

val testStoryDefinitionList: List<TestStoryDefinition> = listOf(test, story_with_other_starter, test2, voice_not_supported, withoutStep, unknown)

object StoryHandlerTest : AbstractStoryHandler()

object StoryHandler2Test : AbstractStoryHandler()

object StoryHandlerVoiceNotSupported : AbstractStoryHandler()

object StoryHandlerWithoutStep : AbstractStoryHandler()

object StoryHandlerUnknown : AbstractStoryHandler()

val otherStory = storyWithSteps<StepTest>("other") {
    end("other")
}

val testWithoutStep = story("withoutStep") {
    end("withoutStep")
}

// stories in order to make BotDefinitionWrapperTest ok
val builtInStories = listOf(
    story("input_story") { end("input_story") },
    story("target") { end("target") }
)

val disableBotTaggedStory = SimpleStoryDefinition(
    id = "tagged_story",
    scriptHandler = StoryHandlerTest,
    starterIntents = setOf(Intent("disable_bot")),
    tags = setOf(StoryTag.DISABLE)
)
