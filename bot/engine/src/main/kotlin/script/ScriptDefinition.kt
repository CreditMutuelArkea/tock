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

package ai.tock.bot.script

import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.definition.StoryTag
import ai.tock.translator.UserInterfaceType

interface ScriptDefinition : IntentAware {

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
     * When this story does not support all [UserInterfaceType]s.
     */
    val unsupportedUserInterfaces: Set<UserInterfaceType>

    /**
     * Is the specified intent is a starter intent?
     */
    fun isStarterIntent(intent: IntentAware) = starterIntents.any { it.wrap(intent) }

    /**
     * Is the specified intent is supported by this story?
     */
    fun supportIntent(intent: IntentAware) = intents.any { it.wrap(intent) }

    /**
     * The "referent" intent for this story.
     */
    fun mainIntent(): IntentAware = starterIntents.first()

    /**
     * Implementation for [IntentAware].
     */
    override fun wrappedIntent(): Intent = mainIntent().wrappedIntent()

}