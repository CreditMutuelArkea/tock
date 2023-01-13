/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

package ai.tock.bot.admin.service

import ai.tock.nlp.front.shared.config.ApplicationDefinition
import ai.tock.nlp.front.shared.config.ScenarioSettings
import ai.tock.nlp.front.shared.config.ScenarioSettingsQuery

/**
 * Scenario settings management service
 * @author Henri-Joel Sedjame
 */
interface ScenarioSettingsService {

        /**
         * Save a scenario settings
         * @param applicationDefinition the application definition to which the scenario settings is linked
         * @param query the save scenario settings query
         */
        fun save(applicationDefinition: ApplicationDefinition, query: ScenarioSettingsQuery)

        /**
         * Get a scenario settings by a given applicationId
         * @param id the application id
         */
        fun getScenarioSettingsByApplicationId(id: String): ScenarioSettings?

        /**
         * Get the allowed repetition number for a scenario settings
         *
         * @param applicationId the id of application to which the scenario settings is linked
         * @param defaultValue the default value to return if no scenario settings is found
         */
        fun getAllowedRepetionNumber(applicationId: String, defaultValue: Int): Int

        /**
         * Listen the scenario settings changes
         * @param listener the action to execute when a scenario settings is changed
         */
        fun listenChanges(listener: (ScenarioSettings) -> Unit)
}