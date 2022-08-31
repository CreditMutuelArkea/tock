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
package ai.tock.bot.mongo

import ai.tock.bot.admin.scenario.Scenario
import ai.tock.bot.admin.scenario.ScenarioDAO
import ai.tock.bot.admin.scenario.ScenarioVersion
import ai.tock.shared.exception.scenario.*
import com.mongodb.client.model.Filters
import com.mongodb.client.result.DeleteResult
import org.litote.kmongo.*

internal object ScenarioMongoDAO : ScenarioDAO {

    internal val scenarioDatabase =
        MongoBotConfiguration.database.getCollection<ScenarioCol>("scenario")

    /**
     * Return a collection of all Scenario.
     */
    override fun findAll(): List<Scenario> {
        return scenarioDatabase.find()
            .toList()
            .map(toScenario)
    }

    /**
     * Return Scenario find by version or null if not exist.
     * @property version of scenario to find.
     */
    override fun findByVersion(version: String): Scenario? {
        val scenarios: List<Scenario> = scenarioDatabase
            .aggregate<ScenarioCol>(match(Filters.eq("versions.version", version)))
            .toList()
            .map(toScenario)

        if(scenarios.size > 1) {
            throw BadNumberOfScenarioException(1, scenarios.size, "at most 1 scenario expected, but ${scenarios.size} have been found")
        }

        return scenarios.firstOrNull()
    }

    /**
     * Return Scenario find by id or null if not exist.
     * @property id of scenario to find.
     */
    override fun findById(id: String): Scenario? {
        return scenarioDatabase.findOneById(id)?.toScenario()
    }

    /**
     * Create Scenario and return it.
     * @property scenario with versions to create.
     * @throws ScenarioWithVersionException when scenario have version with id sets.
     */
    override fun create(scenario: Scenario): Scenario? {
        if(isVersionPresent(scenario)) {
            val version: String = scenario.versions.firstNotNullOf { it.version }
            throw ScenarioWithVersionException(version, "scenario version must not have version")
        }
        return save(scenario.toScenarioCol())?.toScenario()
    }

    /**
     * Patch Scenario and return it.
     * (to create new version on existing scenario with no check)
     * @property scenario with versions to create.
     * @throws ScenarioWithVersionException when scenario have version with id sets.
     */
    override fun patch(scenario: Scenario): Scenario? {
        return save(scenario.toScenarioCol())?.toScenario()
    }

    /**
     * Update Scenario and return it.
     * @property scenario with versions to update.
     * @throws ScenarioWithNoVersionIdException when scenario have version with no id.
     */
    override fun update(scenario: Scenario): Scenario? {
        if(!isIdPresent(scenario)) {
            throw ScenarioWithNoIdException("scenario must have id")
        }
        if(!isVersionPresent(scenario)) {
            throw ScenarioWithNoVersionIdException(scenario.id, "version must have id")
        }
        return save(scenario.toScenarioCol())?.toScenario()
    }

    private fun isVersionPresent(scenario: Scenario): Boolean {
        return scenario.versions.all{ it.version?.isNotBlank() ?: false }
    }

    private fun isIdPresent(scenario: Scenario): Boolean {
        return scenario.id?.isNotBlank() ?: false
    }

    private fun save(scenario: ScenarioCol): ScenarioCol? {
        scenarioDatabase.save(scenario)
        return scenarioDatabase.findOneById(scenario._id)
    }

    /**
     * Delete Scenario by id.
     * @property id of scenario to delete
     * @throws ScenarioNotFoundException when no delete process of id
     */
    override fun delete(id: String) {
        val result: DeleteResult = scenarioDatabase.deleteOneById(id.toId<Scenario>())
        if(result.deletedCount == 0L) {
            throw ScenarioNotFoundException(id, "scenario $id not found in database")
        }
    }

    private val toScenario: ScenarioCol.() -> Scenario = {
        Scenario(
            id = _id.toString(),
            versions = versions.map(toScenarioVersion) )
    }

    private val toScenarioVersion: ScenarioVersionCol.() -> ScenarioVersion = {
        ScenarioVersion (
            version = version.toString(),
            name = name,
            category = category,
            tags = tags,
            applicationId = applicationId,
            createDate = createDate,
            updateDate = updateDate,
            description = description,
            data = data,
            state = state
        )
    }

    private fun Scenario.toScenarioCol(): ScenarioCol {
        return ScenarioCol(
            _id = id?.toId() ?: newId(),
            versions = versions.map(toScenarioVersionCol) )
    }

    private val toScenarioVersionCol: ScenarioVersion.() -> ScenarioVersionCol = {
        ScenarioVersionCol (
            version = version?.toId() ?: newId(),
            name = name,
            category = category,
            tags = tags,
            applicationId = applicationId,
            createDate = createDate,
            updateDate = updateDate,
            description = description,
            data = data,
            state = state
        )
    }
}