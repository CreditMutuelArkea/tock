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

package ai.tock.bot.admin.service.impl

import ai.tock.bot.admin.BotAdminService
import ai.tock.bot.admin.answer.AnswerConfiguration
import ai.tock.bot.admin.answer.AnswerConfigurationType
import ai.tock.bot.admin.answer.TickAnswerConfiguration
import ai.tock.bot.admin.service.ScenarioSettingsService
import ai.tock.bot.admin.service.StoryService
import ai.tock.bot.admin.story.StoryDefinitionConfiguration
import ai.tock.bot.admin.story.StoryDefinitionConfigurationDAO
import ai.tock.bot.admin.story.StoryDefinitionConfigurationFeature
import ai.tock.bot.bean.TickStory
import ai.tock.bot.bean.TickStorySettings
import ai.tock.bot.bean.TickStoryValidation
import ai.tock.bot.bean.unknown.TickUnknownConfiguration
import ai.tock.bot.definition.IntentWithoutNamespace
import ai.tock.nlp.front.service.storage.ApplicationDefinitionDAO
import ai.tock.shared.exception.rest.BadRequestException
import ai.tock.shared.injector
import ai.tock.shared.vertx.WebVerticle
import ai.tock.shared.withoutNamespace
import com.github.salomonbrys.kodein.instance
import com.mongodb.MongoWriteException
import mu.KLogger
import mu.KotlinLogging
import org.litote.kmongo.toId

private const val TICK = "tick"

/**
 * Implementation of StoryService
 */
class StoryServiceImpl : StoryService {

    private val logger: KLogger = KotlinLogging.logger {}
    private val storyDefinitionDAO: StoryDefinitionConfigurationDAO by injector.instance()
    private val settingsService: ScenarioSettingsService by injector.instance()
    private val applicationDefinitionDAO: ApplicationDefinitionDAO by injector.instance()

    init {
        /* On scenarioSettings changes, all TickStoryConfiguration must be updated */
        settingsService.listenChanges { settings ->
            storyDefinitionDAO.getStoryDefinitionByCategory(TICK)
                .forEach { storyDefinition ->
                    val answers: List<AnswerConfiguration> = storyDefinition.answers.map { answer ->
                        if (answer.answerType == AnswerConfigurationType.tick) {
                             (answer as TickAnswerConfiguration).copy(
                                storySettings = TickStorySettings(
                                    settings.actionRepetitionNumber,
                                    settings.redirectStoryId
                                )
                            )
                        } else {
                            answer
                        }
                    }

                    storyDefinitionDAO.save(
                        storyDefinition.copy(
                            answers = answers
                        )
                    )
                }
        }
    }

    override fun getStoryByNamespaceAndBotIdAndStoryId(
        namespace: String,
        botId: String,
        storyId: String
    ): StoryDefinitionConfiguration? = storyDefinitionDAO
        .getStoryDefinitionByNamespaceAndBotIdAndStoryId(namespace, botId, storyId)

    override fun createTickStory(
        namespace: String,
        tickStory: TickStory
    ) {
        val errors = TickStoryValidation.validateTickStory(tickStory)
        if (errors.isEmpty()) {
            saveTickStory(namespace, tickStory)
        } else {
            throw BadRequestException(errors)
        }
    }

    override fun updateActivateStoryFeatureByNamespaceAndBotIdAndStoryId(
        namespace: String,
        botId: String,
        storyId: String,
        feature: StoryDefinitionConfigurationFeature
    ): Boolean {
        val story = storyDefinitionDAO.getStoryDefinitionByNamespaceAndBotIdAndStoryId(namespace, botId, storyId)
        if (story != null) {
            val botConf = BotAdminService.getBotConfigurationsByNamespaceAndBotId(namespace, story.botId).firstOrNull()
            if (botConf != null) {
                storyDefinitionDAO.save(
                    story.copy(features = story.features.filterNot { it.isStoryActivation() } + feature))
            }
        }
        return false
    }

    override fun deleteStoryByNamespaceAndStoryDefinitionConfigurationId(
        namespace: String, storyDefinitionConfigurationId: String
    ): Boolean {
        val story = storyDefinitionDAO.getStoryDefinitionById(storyDefinitionConfigurationId.toId())
        if (story != null) {
            val botConf = BotAdminService.getBotConfigurationsByNamespaceAndBotId(namespace, story.botId).firstOrNull()
            if (botConf != null) {
                storyDefinitionDAO.delete(story)
            }
        }
        return false
    }

    override fun deleteStoryByNamespaceAndBotIdAndStoryId(namespace: String, botId: String, storyId: String): Boolean {
        val story = storyDefinitionDAO.getStoryDefinitionByNamespaceAndBotIdAndStoryId(namespace, botId, storyId)
        if (story != null) {
            val botConf = BotAdminService.getBotConfigurationsByNamespaceAndBotId(namespace, story.botId).firstOrNull()
            if (botConf != null) {
                storyDefinitionDAO.delete(story)
            }
        }
        return false
    }

    private fun saveTickStory(
        namespace: String,
        story: TickStory,
    ) {

        val botConf = BotAdminService.getBotConfigurationsByNamespaceAndBotId(namespace, story.botId).firstOrNull()
        botConf
            ?: WebVerticle.badRequest("No bot configuration is defined yet [namespace: $namespace, botId = ${story.botId}]")

        val application = applicationDefinitionDAO.getApplicationByNamespaceAndName(namespace, botConf.applicationId)
            ?: WebVerticle.badRequest("No application is defined yet [namespace: $namespace, name = ${botConf.applicationId}]")

        val newStory =
            StoryDefinitionConfiguration(
                storyId = story.storyId,
                botId = story.botId,
                intent = IntentWithoutNamespace(story.mainIntent.withoutNamespace()),
                currentType = AnswerConfigurationType.tick,
                answers = listOf(
                    TickAnswerConfiguration(
                        story.stateMachine,
                        story.primaryIntents,
                        story.secondaryIntents,
                        story.triggers,
                        story.contexts,
                        story.actions,
                        story.intentsContexts,
                        TickUnknownConfiguration(story.unknownAnswerConfigs),
                        storySettings = settingsService.getScenarioSettingsByApplicationId(application._id.toString())
                            ?.let { TickStorySettings(it.actionRepetitionNumber, it.redirectStoryId) } ?: TickStorySettings(2),
                        debug = true,
                    )
                ),
                namespace = namespace,
                name = story.name,
                category = TICK,
                description = story.description,
            )

        try {
            // Delete the tick story
            storyDefinitionDAO.deleteStoryDefinitionByNamespaceAndBotIdAndStoryId(namespace, story.botId, story.storyId)
            logger.info { "Removal of the tick story <storyId:${story.storyId}>" }

            storyDefinitionDAO.save(newStory)
            logger.info { "Creation of a new tick story <storyId:${story.storyId}>" }
        } catch (e: MongoWriteException) {
            throw BadRequestException(e.message ?: "Tick Story: registration failed ")
        }
    }

}