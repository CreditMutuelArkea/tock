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

import ai.tock.bot.admin.scenario.ScenarioVersion
import ai.tock.bot.admin.scenario.ScenarioVersionState

/**
 * Service that manage the scenario versions
 */
interface ScenarioVersionService {
    /**
     * Returns one scenario version
     * @param id: id of the scenario version
     * @throws [ScenarioVersionNotFoundException] if the scenario version was not found.
     */
    fun findOneById(id: String): ScenarioVersion

    /**
     * Returns all scenario versions that matches with scenario group and state
     * @param scenarioGroupId: id of the scenario group
     * @param state: state of the scenario version
     */
    fun findAllByScenarioGroupIdAndState(scenarioGroupId: String, state: ScenarioVersionState): List<ScenarioVersion>

    /**
     * Create a new scenario version and returns the created scenario version
     * @param scenarioVersion: the scenario version to create
     */
    fun createOne(scenarioVersion: ScenarioVersion): ScenarioVersion

    /**
     * Create multiple scenario versions and returns the created scenario versions
     * @param scenarioVersions: the scenario versions to create
     */
    fun createMany(scenarioVersions: List<ScenarioVersion>): List<ScenarioVersion>

    /**
     * Update a given scenario version and returns the updated scenario version
     * @param scenarioVersion: the scenario version to update.
     * @throws [ScenarioVersionNotFoundException] if the [scenarioVersion] was not found.
     */
    fun updateOne(scenarioVersion: ScenarioVersion): ScenarioVersion

    /**
     * Delete an existing scenario version.
     * @param id: id of the scenario version
     * @throws [ScenarioVersionNotFoundException] if the scenario version was not found
     */
    fun deleteOneById(id: String)

    /**
     * Delete all existing scenario versions by their scenario group id.
     * @param scenarioGroupId: id of the scenario group
     */
    fun deleteAllByScenarioGroupId(scenarioGroupId: String)

    /**
     * Count the number of scenario versions for the scenario group.
     * @param scenarioGroupId: id of the scenario group
     */
    fun countAllByScenarioGroupId(scenarioGroupId: String): Long

}