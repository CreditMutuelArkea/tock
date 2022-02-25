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

package ai.tock.bot.story.dialogManager

import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.engine.dialogManager.handler.ScriptHandler
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.translator.UserInterfaceType

/**
 * Simple implementation of [StoryDefinition].
 */
open class SimpleStoryDefinition(
    override val id: String,
    override val scriptHandler: ScriptHandler,
    override val starterIntents: Set<IntentAware>,
    /**
     * starter intents + other intents supported by the story.
     */
    override val intents: Set<IntentAware> = starterIntents,
    override val steps: Set<SimpleStoryStep> = emptySet(),
    override val unsupportedUserInterfaces: Set<UserInterfaceType> = emptySet(),
    override val tags: Set<StoryTag> = emptySet()
) : StoryDefinition {

    constructor(
        id: String,
        scriptHandler: ScriptHandler,
        steps: Array<out SimpleStoryStep> = emptyArray(),
        starterIntents: Set<IntentAware>,
        intents: Set<IntentAware> = starterIntents,
        unsupportedUserInterfaces: Set<UserInterfaceType> = emptySet()
    ) :
        this(
            id = id,
            scriptHandler = scriptHandler,
            starterIntents = starterIntents.map { it.wrappedIntent() }.toSet(),
            intents = intents.map { it.wrappedIntent() }.toSet(),
            steps = steps.toSet(),
            unsupportedUserInterfaces = unsupportedUserInterfaces
        )

    override fun name(): String {
        return mainIntent().name()
    }
}
