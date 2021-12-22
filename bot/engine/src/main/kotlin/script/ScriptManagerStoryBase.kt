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
import ai.tock.bot.admin.story.StoryDefinitionConfigurationDAO
import ai.tock.bot.definition.BotDefinitionBase
import ai.tock.bot.definition.Intent
import ai.tock.bot.definition.Intent.Companion.unknown
import ai.tock.bot.definition.IntentAware
import ai.tock.bot.engine.dialog.Story
import ai.tock.bot.story.dialogManager.StoryDefinition
import ai.tock.bot.engine.dialogManager.handler.ScriptHandler
import ai.tock.bot.engine.dialogManager.story.storySteps.SimpleStoryStep
import ai.tock.bot.story.dialogManager.handler.StoryHandler
import ai.tock.bot.story.dialogManager.handler.StoryHandlerBase
import ai.tock.nlp.api.client.model.dump.IntentDefinition
import ai.tock.shared.Executor
import ai.tock.shared.injector
import ai.tock.shared.provide
import ai.tock.shared.withoutNamespace
import com.github.salomonbrys.kodein.instance
import engine.dialogManager.step.Step

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

    private val storyDAO: StoryDefinitionConfigurationDAO by injector.instance()

    //TODO : je ne sais pas encore comment initialisé cette story, ça dépend de la userTimeline, et du Dialog
    @Volatile
    var currentStory: Story

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

    override fun findIntent(intent: String, applicationId: String): Intent {
        return findIntent(stories, intent)
    }

    override fun findMainIntent(scriptStep: ScriptStep): IntentAware? {
        return when(scriptStep) {
            START_SCRIPT -> helloStory?.mainIntent()
            END_SCRIPT -> goodbyeStory?.mainIntent()
            DEFAULT -> defaultStory.mainIntent()
        }
    }

    override fun getHandleAttachmentIntent() : IntentAware? = handleAttachmentStory?.mainIntent()

    override fun getUserLocationIntent() : IntentAware? = userLocationStory?.mainIntent()

    override fun getFrontUnkowIntents(frontIntents: List<IntentDefinition>): List<IntentAware> {
        return stories
            .filter { !it.mainIntent().wrap(unknown) }
            .filter {
                !frontIntents
                    .map { it.name.withoutNamespace() }
                    .contains(it.mainIntent().name().withoutNamespace())
            }

    }

    override fun initNameSpace(namespace: String): Unit {
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
        ).forEach {
            (it.storyHandler as? StoryHandlerBase<*>)?.apply {
                i18nNamespace = namespace
            }
        }
    }

    /**
     * Search story by storyId.
     */
    fun findStoryDefinitionById(storyId: String, applicationId: String): StoryDefinition {
        return stories.find { it.id == storyId } ?: unknownStory
    }

    /**
     * Finds a [StoryDefinition] from an [Intent].
     */
    fun findStoryDefinition(intent: IntentAware?, applicationId: String): StoryDefinition {
        return if (intent is StoryDefinition) {
            intent
        } else {
            findStoryDefinition(intent?.name(), applicationId)
        }
    }

    /**
     * Search story by storyHandler.
     */
    fun findStoryByStoryHandler(storyHandler: ScriptHandler, applicationId: String): StoryDefinition? {
        return stories.find { it.storyHandler == storyHandler }
    }

    /**
     * Finds a [StoryDefinition] from an intent name.
     *
     * @param intent the intent name
     * @param applicationId the optional applicationId
     */
    fun findStoryDefinition(intent: String?, applicationId: String): StoryDefinition {
        return findStoryDefinition(stories, intent, unknownStory, keywordStory)
    }

    override fun isEnableEndScript(namespace: String, botId: String, applicationId: String): Boolean {
        //Check if there is a configuration for Ending story
        val storySetting = storyDAO.getStoryDefinitionsByNamespaceBotIdStoryId(
            namespace,
            botId,
            currentStory.definition.id
        )
        return storySetting?.findEnabledEndWithStoryId(applicationId) == null
    }

    override fun getCurrentStep(): SimpleStoryStep? {
        return currentStory.currentStep
    }

    override fun changeCurrentStep(stepName: String?) {
        currentStory.step = stepName
    }

}