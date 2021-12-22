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

import ai.tock.bot.admin.answer.AnswerConfigurationType.builtin
import ai.tock.bot.admin.bot.BotApplicationConfigurationKey
import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.bot.definition.BotDefinition
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.Intent.Companion.unknown
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.bot.engine.dialogManager.handler.ScriptHandler
import ai.tock.bot.story.definition.StoryTag
import ai.tock.bot.engine.action.Action
import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.user.UserTimeline
import ai.tock.bot.story.config.ConfiguredStoryDefinition
import mu.KotlinLogging

/**
 *
 */
internal class BotDefinitionWrapper(val botDefinition: BotDefinition) : BotDefinition by botDefinition {

    private val logger = KotlinLogging.logger {}

    // stories with configuration (including built-in)
    @Volatile
    private var configuredStories: Map<String, List<ConfiguredStoryDefinition>> = emptyMap()

    @Volatile
    private var allStoriesById: Map<String, StoryDefinition> = botDefinition.stories.associateBy { it.id }

    override val botDisabledStories: List<StoryDefinition>
        get() = findStoryDefinitionByTag(StoryTag.DISABLE)

    override val botEnabledStories: List<StoryDefinition>
        get() = findStoryDefinitionByTag(StoryTag.ENABLE)

    override val stories: List<StoryDefinition>
        get() = allStories

    // only built-in
    private val builtInStoriesMap: Map<String, StoryDefinition> = botDefinition.stories.associateBy { it.id }

    // all stories
    //@Volatile
    //private var allStories: List<StoryDefinition> = botDefinition.stories

    override fun disableBot(timeline: UserTimeline, dialog: Dialog, action: Action): Boolean =
        super.disableBot(timeline, dialog, action)

    override fun enableBot(timeline: UserTimeline, dialog: Dialog, action: Action): Boolean =
        super.enableBot(timeline, dialog, action)

    override fun hasDisableTagIntent(dialog: Dialog): Boolean =
        super.hasDisableTagIntent(dialog)

    /**
     * cette méthode sert à ... //TODO
     */
    override fun findIntent(intent: String, applicationId: String): Intent {
        val i = super.findIntent(intent, applicationId)
        return if (i == unknown) {
            val i2 = botDefinition.findIntent(intent, applicationId)
            if (i2 == unknown) {
                BotDefinition.findIntent(intent, applicationId)
            } else {
                i2
            }
        } else i
    }

    override fun findStoryDefinition(intent: IntentAware?, applicationId: String): StoryDefinition {
        return findStoryDefinition(intent?.name(), applicationId)
    }

    private fun StoryDefinition.checkApplicationId(applicationId: String): StoryDefinition {
        return if (this is ConfiguredStoryDefinition
            && configuration.configuredSteps.isNotEmpty()
            && answerType != builtin
        ) {
            ConfiguredStoryDefinition(
                this@BotDefinitionWrapper,
                configuration,
                BotApplicationConfigurationKey(applicationId, this@BotDefinitionWrapper)
            )
        } else {
            this
        }
    }

    override fun toString(): String {
        return "Wrapper($botDefinition)"
    }












    private fun findStoryDefinitionByTag(tag: StoryTag): List<StoryDefinition> =
        stories.filter { it.tags.contains(tag) }

    fun updateStories(configuredStories: List<StoryDefinitionConfiguration>) {
        this.configuredStories =
            configuredStories.map { ConfiguredStoryDefinition(this, it) }.groupBy { it.storyId }

        allStories = (
                this.configuredStories +
                        // in order to handle built-in not yet configured...
                        botDefinition
                            .stories
                            .asSequence()
                            .filterNot { this.configuredStories.containsKey(it.id) }
                            .groupBy { it.id }
                )
            .values.flatten()

        this.allStoriesById = allStories.associateBy { it.id }
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


    private fun findStory(intent: String?, applicationId: String): StoryDefinition =
        BotDefinition.findStoryDefinition(
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


    override fun findStoryDefinition(intent: String?, applicationId: String): StoryDefinition =
        findStoryDefinition(intent, applicationId, intent).let {
            if (it is ConfiguredStoryDefinition && it.answerType == builtin) {
                builtInStory(it.storyId)
            } else {
                it
            }
        }

    override fun findStoryDefinitionById(storyId: String, applicationId: String): StoryDefinition =
        // first search into built-in then in configured, fallback to search by intent
        builtInStoriesMap[storyId] ?: allStoriesById[storyId]?.checkApplicationId(applicationId) ?: findStoryDefinition(
            storyId,
            applicationId
        )

    override fun findStoryByStoryHandler(storyHandler: ScriptHandler, applicationId: String): StoryDefinition? =
        (
                botDefinition.stories.find { it.storyHandler == storyHandler }
                    ?: stories.find { it.storyHandler == storyHandler }
                )
            ?.checkApplicationId(applicationId)

}
