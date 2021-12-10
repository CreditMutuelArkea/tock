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

package ai.tock.bot.engine.dialogManager.story

import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.definition.StoryTag
import ai.tock.bot.engine.dialogManager.story.handler.StoryHandler
import ai.tock.bot.engine.dialogManager.story.handler.StoryHandlerDefinition
import ai.tock.bot.engine.dialogManager.story.storySteps.StoryStep
import ai.tock.translator.UserInterfaceType

/**
 * Simple implementation of [StoryDefinition].
 */
open class SimpleStoryDefinition(
    override val id: String,
    override val storyHandler: StoryHandler,
    override val starterIntents: Set<IntentAware>,
    /**
     * starter intents + other intents supported by the story.
     */
    override val intents: Set<IntentAware> = starterIntents,
    override val steps: Set<StoryStep<StoryHandlerDefinition>> = emptySet(),
    override val unsupportedUserInterfaces: Set<UserInterfaceType> = emptySet(),
    override val tags: Set<StoryTag> = emptySet()
) :
    StoryDefinition {

    constructor(
        id: String,
        storyHandler: StoryHandler,
        steps: Array<out StoryStep<StoryHandlerDefinition>> = emptyArray(),
        starterIntents: Set<IntentAware>,
        intents: Set<IntentAware> = starterIntents,
        unsupportedUserInterfaces: Set<UserInterfaceType> = emptySet()
    ) :
        this(
            id = id,
            storyHandler = storyHandler,
            starterIntents = starterIntents.map { it.intent() }.toSet(),
            intents = intents.map { it.intent() }.toSet(),
            steps = steps.toSet(),
            unsupportedUserInterfaces = unsupportedUserInterfaces
        )

    override fun name(): String {
        return mainIntent().name()
    }
}
