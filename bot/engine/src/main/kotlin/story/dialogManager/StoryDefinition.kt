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

import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.engine.dialogManager.handler.ScriptHandler
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.translator.UserInterfaceType

/**
 * The definition of a "Story".
 * A story holds a list of actions of the same domain.
 * The story provides a set of starter intents.
 * When theses intents are detected, The story is started.
 *
 * Story definitions should usually not directly extend this class,
 * but instead extend [SimpleStoryHandlerBase] or [StoryDefinitionBase].
 */
interface StoryDefinition : IntentAware {

    /**
     * An unique identifier for a given bot.
     */
    val id: String

    /**
     * One or more intents that start the story.
     * Usually, you don't have the same starter intent in two different story definition.
     */
    val starterIntents: Set<IntentAware>

    /**
     * The complete list of intents supported by the story.
     */
    val intents: Set<IntentAware>

    /**
     * The story definition tags that specify different story types or roles.
     */
    val tags: Set<StoryTag>

    /**
     * Does this story is tagged with specified [tag]?
     */
    fun hasTag(tag: StoryTag): Boolean = tags.contains(tag)

    /**
     * The story handler of the story.
     */
    val storyHandler: ScriptHandler

    /**
     * The root steps of the story.
     */
    val steps: Set<SimpleStoryStep>

    /**
     * When this story does not support all [UserInterfaceType]s.
     */
    val unsupportedUserInterfaces: Set<UserInterfaceType>

    /**
     * Is the specified intent is a starter intent?
     */
    fun isStarterIntent(intent: IntentAware) = starterIntents.contains(intent)

    /**
     * Is the specified intent is supported by this story?
     */
    fun supportIntent(intent: IntentAware) = intents.contains(intent)

    /**
     * The "referent" intent for this story.
     */
    fun mainIntent(): IntentAware = starterIntents.first()

    /**
     * Implementation for [IntentAware].
     */
    override fun wrappedIntent(): Intent = mainIntent().wrappedIntent()

    /**
     * Returns all steps of the story.
     */
    fun allSteps(): Set<SimpleStoryStep> =
        mutableSetOf<SimpleStoryStep>().apply { steps.forEach { allStep(this, it) } }

    private fun allStep(result: MutableSet<SimpleStoryStep>, step: SimpleStoryStep) {
        result.add(step)
        step.children.forEach { allStep(result, it) }
    }
}
