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

package ai.tock.bot.admin.scenario

import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.isVersionOf
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.isArchive
import ai.tock.bot.admin.model.scenario.ScenarioRequest
import ai.tock.bot.admin.model.scenario.ScenarioResult
import ai.tock.bot.admin.scenario.ScenarioState.*
import ai.tock.shared.exception.scenario.*
import com.fasterxml.jackson.databind.ObjectMapper
import java.time.ZonedDateTime

class ScenarioMapper {
    companion object {
        private val scenarioObjectMapper = ObjectMapper()

        /**
         * Lambda to map a Scenario to a List of ScenarioResult
         */
        val toScenarioResults: Scenario.() -> List<ScenarioResult> = {
            data.map {
                it.toScenarioResult(this)
            }
        }

        /**
         * Function to map a Scenario to a List of ScenarioResult
         */
        fun Scenario.toScenarioResults(): List<ScenarioResult> {
            return toScenarioResults.invoke(this)
        }
        /**
         * Map a Scenario to a new ScenarioRequest
         */
        fun ScenarioVersion.toScenarioResult(scenario: Scenario): ScenarioResult {
            return ScenarioResult(
                id = version ?: throw ScenarioWithNoVersionIdException(scenario.id, "cannot create scenarioResult with id null"),
                sagaId = scenario.id ?: throw ScenarioWithNoIdException("cannot create scenarioResult with sagaId null"),
                name = name,
                category = category,
                tags = tags,
                applicationId = applicationId,
                createDate = createDate,
                updateDate = updateDate,
                description = description,
                data = data?.let { scenarioObjectMapper.readTree(it) },
                state = state
            )
        }

        /**
         * Map a ScenarioRequest to a new Scenario
         */
        fun ScenarioRequest.toScenario():  Scenario {
            return Scenario(
                id = sagaId,
                data = listOf(
                    ScenarioVersion(
                        version = id,
                        name = name,
                        category = category,
                        tags = tags,
                        applicationId = applicationId,
                        createDate = createDate,
                        updateDate = updateDate,
                        description = description,
                        data =  data?.let { scenarioObjectMapper.writeValueAsString(it) },
                        state = state
                    )
                )
            )
        }

        /**
         * Create a new ScenarioHistory duplicated with dates changed by those passed in parameters
         */
        fun ScenarioVersion.cloneWithOverriddenDates(
            newCreateDate: ZonedDateTime?,
            newUpdateDate: ZonedDateTime?): ScenarioVersion {

            return ScenarioVersion(
                version = version,
                name = name,
                category = category,
                tags = tags,
                applicationId = applicationId,
                createDate = newCreateDate,
                updateDate = newUpdateDate,
                description = description,
                data = data,
                state = state
            )
        }

        /**
         * Create new scenario with data does not contain specified version
         */
        fun Scenario.excludeVersion(version: String): Scenario {
            return replaceData(data.filterNot { it.isVersionOf(version) })
        }

        /**
         * Create new scenario with data contain only versions specified
         */
        fun Scenario.filterVersions(versions: Set<String>): Scenario {
            return replaceData(data.filter { versions.contains(it.version) })
        }

        /**
         * Create new collection of scenarios with data contain no archived versions
         */
        fun Collection<Scenario>.filterActive(): Collection<Scenario> {
            return map { it.replaceData(it.data.filterNot(isArchive)) }
        }

        /**
         * Create new scenario with data contain histories of original and histories passed in parameter
         */
        fun Scenario.addVersions(dataInDatabase: List<ScenarioVersion>): Scenario {
            return replaceData(listOf(dataInDatabase, data).flatten())
        }

        /**
         * Create new scenario with data contain histories of original excluded from those passed in parameters
         */
        fun Scenario.filterExcludeVersions(dataInDatabase: List<ScenarioVersion>): Scenario {
            return replaceData(data.filterNot { dataInDatabase.contains(it) })
        }

        /**
         * Create a new ScenarioHistory form this, with dates passed in parameters
         */
        fun Scenario.replaceData(data: List<ScenarioVersion>): Scenario {
            return Scenario(
                id = id,
                data = data
            )
        }

        /**
         * Create a new scenario history with state is replace by archive
         */
        fun ScenarioVersion.archive(): ScenarioVersion {
            return ScenarioVersion (
                version = version,
                name = name,
                category = category,
                tags = tags,
                applicationId = applicationId,
                createDate = createDate,
                updateDate = updateDate,
                description = description,
                data = data,
                state = ARCHIVE
            )
        }
    }
}
