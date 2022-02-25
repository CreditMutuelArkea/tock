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

package ai.tock.bot.engine.config

import ai.tock.bot.DialogManager.ScriptManagerStory
import ai.tock.bot.admin.answer.AnswerConfigurationType.builtin
import ai.tock.bot.admin.bot.BotApplicationConfigurationKey
import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.bot.definition.Intent.Companion.unknown
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.story.config.ConfiguredStoryDefinition
import ai.tock.bot.story.dialogManager.handler.StoryHandler
import mu.KotlinLogging

/**
 *
 */
internal class ScriptManagerStoryWrapper(
    val scriptManager: ScriptManagerStory,
    val botDefinition: BotStoryDefinitionWrapper
) : ScriptManagerStory by scriptManager {

    private val logger = KotlinLogging.logger {}

    // stories with configuration (including built-in)
    @Volatile
    private var configuredStories: Map<String, List<ConfiguredStoryDefinition>> = emptyMap()

    @Volatile
    private var allStoriesById: Map<String, StoryDefinition> = stories.associateBy { it.id }


    private fun findStoryDefinitionByTag(tag: StoryTag): List<StoryDefinition> =
        stories.filter { it.tags.contains(tag) }

    // only built-in
    private val builtInStoriesMap: Map<String, StoryDefinition> = stories.associateBy { it.id }


    override val disabledStories: List<StoryDefinition>
        get() = findStoryDefinitionByTag(StoryTag.DISABLE)

    override val enabledStories: List<StoryDefinition>
        get() = findStoryDefinitionByTag(StoryTag.ENABLE)

    fun updateStories(configuredStories: List<StoryDefinitionConfiguration>) {
        this.configuredStories =
            configuredStories
                .map { ConfiguredStoryDefinition(botDefinition, it) }
                .groupBy { it.storyId }

        stories = (
                this.configuredStories +
                        // in order to handle built-in not yet configured...
                        scriptManager
                            .stories
                            .asSequence()
                            .filterNot { this.configuredStories.containsKey(it.id) }
                            .groupBy { it.id }
                )
            .values.flatten()

        this.allStoriesById = stories.associateBy { it.id }
    }

    override fun findIntent(intent: String, applicationId: String): IntentAware {
        var searchIntent = scriptManager.findIntent(intent, applicationId)
        if (searchIntent.wrap(unknown)) {
            searchIntent = ScriptManagerStory.findIntent(stories, intent)
        }
        return searchIntent
    }

    override fun findStoryDefinition(intent: IntentAware?, applicationId: String): StoryDefinition {
        return findStoryDefinition(intent?.wrappedIntent()?.name, applicationId)
    }

    private fun findStory(intent: String?, applicationId: String): StoryDefinition =
        ScriptManagerStory.findStoryDefinition(
            stories
                .asSequence()
                .filter {
                    when (it) {
                        is ConfiguredStoryDefinition -> !it.isDisabled(applicationId)
                        else -> true
                    }
                }
                .map { it.checkApplicationId(applicationId) }
                .toList(),
            intent,
            unknownStory,
            keywordStory
        )

    internal fun builtInStory(storyId: String): StoryDefinition =
        builtInStoriesMap[storyId] ?: returnsUnknownStory(storyId)

    private fun returnsUnknownStory(storyId: String): StoryDefinition =
        unknownStory.also {
            logger.warn { "unknown story: $storyId" }
        }

    private fun findStoryDefinition(intent: String?, applicationId: String, initialIntent: String?): StoryDefinition {
        val story = findStory(intent, applicationId)

        return (story as? ConfiguredStoryDefinition)?.let {
            val switchId = it.findEnabledStorySwitchId(applicationId)
            if (switchId != null) {
                (configuredStories[switchId] ?: listOfNotNull(builtInStoriesMap[switchId]))
                    .let { stories ->
                        val targetStory = stories
                            .asSequence()
                            .filterIsInstance<ConfiguredStoryDefinition>()
                            .filterNot { c -> c.isDisabled(applicationId) }
                            .run {
                                firstOrNull { c -> c.answerType != builtin } ?: firstOrNull()
                            }
                            ?: stories.firstOrNull { c -> c !is ConfiguredStoryDefinition }

                        targetStory
                            ?.let { toStory ->
                                val storyMainIntent = toStory.mainIntent().name()
                                if (storyMainIntent == initialIntent) {
                                    toStory.checkApplicationId(applicationId)
                                } else {
                                    findStoryDefinition(storyMainIntent, applicationId, initialIntent)
                                }
                            }
                    }
                    ?: story
            } else {
                it
            }
        } ?: story
    }

    override fun findStoryDefinition(intent: String?, applicationId: String): StoryDefinition =
        findStoryDefinition(intent, applicationId, intent).let {
            if (it is ConfiguredStoryDefinition && it.answerType == builtin) {
                builtInStory(it.storyId)
            } else {
                it
            }
        }

    override fun findScriptDefinitionById(storyId: String, applicationId: String): StoryDefinition =
        // first search into built-in then in configured, fallback to search by intent
        builtInStoriesMap[storyId]
            ?: allStoriesById[storyId]?.checkApplicationId(applicationId)
            ?: findStoryDefinition(storyId, applicationId)

    fun findScriptByStoryHandler(scriptHandler: StoryHandler, applicationId: String): StoryDefinition? {
        val byStoryHandler: (StoryDefinition)->Boolean = { it.scriptHandler == scriptHandler }
        val storieDefinition: StoryDefinition? = stories.find(byStoryHandler)
        return storieDefinition?.checkApplicationId(applicationId)
    }

    private fun StoryDefinition.checkApplicationId(applicationId: String): StoryDefinition =
        if (this is ConfiguredStoryDefinition &&
            configuration.configuredSteps.isNotEmpty() &&
            answerType != builtin
        ) {
            ConfiguredStoryDefinition(
                botDefinition,
                configuration,
                BotApplicationConfigurationKey(applicationId, botDefinition)
            )
        } else {
            this
        }

    override fun toString(): String {
        return "Wrapper($scriptManager)"
    }
}