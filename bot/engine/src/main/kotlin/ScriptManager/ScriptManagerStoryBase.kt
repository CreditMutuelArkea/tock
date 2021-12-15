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

import ai.tock.bot.ScriptManager.ScriptStep
import ai.tock.bot.ScriptManager.ScriptStep.*
import ai.tock.bot.definition.BotDefinitionBase
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.Intent.Companion.unknown
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.dialogManager.story.StoryDefinition
import ai.tock.nlp.api.client.model.dump.IntentDefinition
import ai.tock.shared.Executor
import ai.tock.shared.injector
import ai.tock.shared.provide
import ai.tock.shared.withoutNamespace

class ScriptManagerStoryBase(
    override val stories: List<StoryDefinition>,
    override val unknownStory: StoryDefinition = BotDefinitionBase.defaultUnknownStory,
    override val helloStory: StoryDefinition? = null,
    override val goodbyeStory: StoryDefinition? = null,
    override val noInputStory: StoryDefinition? = null,
    override val botDisabledStory: StoryDefinition? = null,
    override val botEnabledStory: StoryDefinition? = null,
    override val userLocationStory: StoryDefinition? = null,
    override val handleAttachmentStory: StoryDefinition? = null,
    override val keywordStory: StoryDefinition = BotDefinitionBase.defaultKeywordStory,
) : ScriptManagerStory {

    private val executor: Executor get() = injector.provide()

    companion object {

        /**
         * Finds an intent from an intent name and a list of [StoryDefinition].
         * Is no valid intent found, returns [unknown].
         */
        internal fun findIntent(stories: List<StoryDefinition>, intent: String): Intent {
            val targetIntent = Intent(intent)
            return if (stories.any { it.supportIntent(targetIntent) } ||
                stories.any { it.allSteps().any { s -> s.supportIntent(targetIntent) } }
            ) {
                targetIntent
            } else {
                if (intent == Intent.keyword.name) {
                    Intent.keyword
                } else {
                    unknown
                }
            }
        }

        /**
         * Finds a [StoryDefinition] from a list of [StoryDefinition] and an intent name.
         * Is no valid [StoryDefinition] found, returns the [unknownStory].
         */
        internal fun findStoryDefinition(
            stories: List<StoryDefinition>,
            intent: String?,
            unknownStory: StoryDefinition,
            keywordStory: StoryDefinition
        ): StoryDefinition {
            return if (intent == null) {
                unknownStory
            } else {
                val i = findIntent(stories, intent)
                stories.find { it.isStarterIntent(i) }
                    ?: if (intent == Intent.keyword.name) keywordStory else unknownStory
            }
        }
    }

    override fun findMainIntent(scriptStep: ScriptStep): IntentAware? {
        return when(scriptStep) {
            START_SCRIPT -> helloStory?.mainIntent()
            END_SCRIPT -> goodbyeStory?.mainIntent()
            DEFAULT -> defaultStory.mainIntent()
        }
    }

    override fun getFrontUnkowIntents(frontIntents: List<IntentDefinition>): List<IntentAware> {
        return stories
            .filter { !it.mainIntent().wrap(unknown) }
            .filter {
                !frontIntents
                    .map { it.name.withoutNamespace() }
                    .contains(it.mainIntent().name().withoutNamespace())
            }

    }

    override fun initNameSpace(init: (StoryDefinition) -> Unit) {
        (
           stories +
                listOfNotNull(
                    unknownStory,
                    helloStory,
                    goodbyeStory,
                    noInputStory,
                    botDisabledStory,
                    botEnabledStory,
                    userLocationStory,
                    handleAttachmentStory,
                    keywordStory
                )
        ).forEach( init )
    }
}