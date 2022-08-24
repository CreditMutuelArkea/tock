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

package ai.tock.bot.admin.scenario

import ai.tock.bot.admin.model.scenario.ScenarioResult
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.createScenario
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.draft
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.current
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.archive
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.createScenarioResult
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkContainsNoVersion
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkContainsOne
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkContainsOnlyDraft
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkContainsSpecificVersion
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkIdNotNull
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkIsNotEmpty
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkNotNullForId
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkToCreate
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkToUpdate
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.extractVersionsAndCheckIsNotEmpty
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.haveVersion
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.isDraft
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.isCurrent
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.isArchive
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.isVersionOf
import ai.tock.bot.admin.scenario.ScenarioState.*
import ai.tock.shared.exception.scenario.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ScenarioPredicateTest {

    private val ID1 = "id_test_1"
    private val ID2 = "id_test_2"

    private val VERSION1 = "version_test_1"
    private val VERSION2 = "version_test_2"

    @Test
    fun `GIVEN scenarionVersion with version WHEN invoke haveVersion THEN return true`() {
        val scenarioVersion = draft(VERSION1)
        assertTrue { scenarioVersion.haveVersion() }
    }

    @Test
    fun `GIVEN scenarionVersion with no version WHEN invoke haveVersion THEN return false`() {
        val scenarioVersion = draft(null)
        assertFalse { scenarioVersion.haveVersion() }
    }

    @Test
    fun `GIVEN scenario whith no id WHEN checkToCreate THEN no exception thrown`() {
        val scenario = createScenario(null, draft(null))
        assertDoesNotThrow { scenario.checkToCreate() }
    }

    @Test
    fun `GIVEN scenario empty whith no id and no versions WHEN checkToCreate THEN exception thrown`() {
        val scenario = createScenario(null)
        assertThrows<ScenarioEmptyException> { scenario.checkToCreate() }
    }

    @Test
    fun `GIVEN scenario with version state not draft WHEN checkToCreate THEN no exception thrown`() {
        val scenario = createScenario(null, draft(null), current(null))
        assertThrows<BadScenarioStateException> { scenario.checkToCreate() }
    }

    @Test
    fun `GIVEN scenario with id and version WHEN checkToCreate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(null), draft(VERSION1))
        assertThrows<ScenarioWithVersionException> { scenario.checkToCreate() }
    }

    @Test
    fun `GIVEN scenario with no versions WHEN checkContainsNoVersion THEN no exception thrown`() {
        val scenario = createScenario(null, draft(null), draft(null))
        assertDoesNotThrow { scenario.checkContainsNoVersion() }
    }

    @Test
    fun `GIVEN scenario with versions WHEN checkContainsNoVersion THEN exception is thrown`() {
        val scenario = createScenario(null, draft(null), draft(VERSION1))
        assertThrows<ScenarioWithVersionException> { scenario.checkContainsNoVersion() }
    }

    @Test
    fun `GIVEN scenarioVersion with expected version WHEN checkContainsSpecificVersion THEN no exception thrown`() {
        val scenarioVersion = draft(VERSION1)
        assertDoesNotThrow { scenarioVersion.checkContainsSpecificVersion(VERSION1) }
    }

    @Test
    fun `GIVEN scenarioVersion with no version WHEN checkContainsSpecificVersion THEN exception is thrown`() {
        val scenarioVersion = draft(null)
        assertThrows<BadScenarioVersionException> { scenarioVersion.checkContainsSpecificVersion(VERSION1) }
    }

    @Test
    fun `GIVEN scenarioVersion with version not expected WHEN checkContainsSpecificVersion THEN exception is thrown`() {
        val scenarioVersion = draft(VERSION2)
        assertThrows<BadScenarioVersionException> { scenarioVersion.checkContainsSpecificVersion(VERSION1) }
    }

    @Test
    fun `GIVEN scenario with one version draft WHEN checkContainsOnlyDraft THEN no exception thrown`() {
        val scenario = createScenario(null, draft(null))
        assertDoesNotThrow { scenario.checkContainsOnlyDraft() }
    }

    @Test
    fun `GIVEN scenario with multiple version draft WHEN checkContainsOnlyDraft THEN no exception thrown`() {
        val scenario = createScenario(null, draft(null), draft(null), draft(null))
        assertDoesNotThrow { scenario.checkContainsOnlyDraft() }
    }

    @Test
    fun `GIVEN scenario with no version WHEN checkContainsOnlyDraft THEN no exception thrown`() {
        val scenario = createScenario(null)
        assertDoesNotThrow { scenario.checkContainsOnlyDraft() }
    }

    @Test
    fun `GIVEN scenario with a version not draft WHEN checkContainsOnlyDraft THEN exception is thrown`() {
        val scenario = createScenario(null, draft(null), current(null))
        assertThrows<BadScenarioStateException> { scenario.checkContainsOnlyDraft() }
    }

    @Test
    fun `GIVEN scenario with data not empty WHEN checkIsNotEmpty THEN no exception thrown`() {
        val scenario = createScenario(null, draft(null), current(null))
        assertDoesNotThrow { scenario.checkIsNotEmpty() }
    }

    @Test
    fun `GIVEN scenario with no data WHEN checkIsNotEmpty THEN exception is thrown`() {
        val scenario = createScenario(null)
        assertThrows<ScenarioEmptyException> { scenario.checkIsNotEmpty() }
    }

    @Test
    fun `GIVEN scenarioVersion with version expected WHEN isVersionOf THEN return true`() {
        val scenarioVersion = draft(VERSION1)
        assertTrue { scenarioVersion.isVersionOf(VERSION1) }
    }

    @Test
    fun `GIVEN scenarioVersion with version not expected WHEN isVersionOf THEN return false`() {
        val scenarioVersion = draft(VERSION2)
        assertFalse { scenarioVersion.isVersionOf(VERSION1) }
    }

    @Test
    fun `GIVEN scenarioVersion with no version WHEN isVersionOf THEN return false`() {
        val scenarioVersion = draft(null)
        assertFalse { scenarioVersion.isVersionOf(VERSION1) }
    }

    @Test
    fun `GIVEN scenarioVersion with state draft WHEN isDraft THEN return true`() {
        val scenarioVersion = draft(null)
        assertTrue { scenarioVersion.isDraft() }
    }

    @Test
    fun `GIVEN scenarioVersion with state current WHEN isDraft THEN return false`() {
        val scenarioVersion = current(null)
        assertFalse { scenarioVersion.isDraft() }
    }

    @Test
    fun `GIVEN scenarioVersion with state current WHEN isCurrent THEN return true`() {
        val scenarioVersion = current(null)
        assertTrue { scenarioVersion.isCurrent() }
    }

    @Test
    fun `GIVEN scenarioVersion with state archive WHEN isCurrent THEN return false`() {
        val scenarioVersion = archive(null)
        assertFalse { scenarioVersion.isCurrent() }
    }

    @Test
    fun `GIVEN scenarioVersion with state archive WHEN isArchive THEN return true`() {
        val scenarioVersion = archive(null)
        assertTrue { scenarioVersion.isArchive() }
    }

    @Test
    fun `GIVEN scenarioVersion with state draft WHEN isArchive THEN return false`() {
        val scenarioVersion = draft(null)
        assertFalse { scenarioVersion.isArchive() }
    }

    @Test
    fun `GIVEN scenario id already exist in database WHEN checkToUpdate THEN no exception thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1), draft(VERSION2))
        assertDoesNotThrow { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data from database is archive but not requested to updte WHEN checkToUpdate THEN no exception thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1), archive(VERSION2))
        assertDoesNotThrow { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data to update is empty WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1)
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1))
        assertThrows<ScenarioWithNoVersionIdException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data to update have no version WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(null))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1))
        assertThrows<ScenarioWithNoVersionIdException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data to update have duplicate version WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1), draft(VERSION1))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1))
        assertThrows<DuplicateVersionException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data from database is empty WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFromBdd = createScenario(ID1, draft(null))
        assertThrows<ScenarioWithNoVersionIdException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data from database have duplicate version WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1), draft(VERSION1))
        assertThrows<DuplicateVersionException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data to update contains unknown version WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(VERSION2))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1))
        assertThrows<VersionUnknownException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data from database is archive for version to update WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1), draft(VERSION2))
        val scenarioFromBdd = createScenario(ID1, archive(VERSION1), draft(VERSION2))
        assertThrows<ScenarioArchivedException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario data to update at archive state WHEN checkToUpdate THEN exception is thrown`() {
        val scenario = createScenario(ID2, draft(VERSION1))
        val scenarioFromBdd = createScenario(ID1, draft(VERSION1))
        assertThrows<MismatchedScenarioException> { scenario.checkToUpdate(scenarioFromBdd) }
    }

    @Test
    fun `GIVEN scenario with one version WHEN extractVersionsAndCheckIsNotEmpty THEN return version`() {
        val scenario = createScenario(ID1, draft(VERSION1))
        val versions: Map<String, ScenarioState> = scenario.extractVersionsAndCheckIsNotEmpty()
        assertEquals(1, versions.size)
        assertEquals(VERSION1, versions.keys.first())
        assertEquals(DRAFT, versions[VERSION1])
    }

    @Test
    fun `GIVEN scenario with two version WHEN extractVersionsAndCheckIsNotEmpty THEN return versions`() {
        val scenario = createScenario(ID1, draft(VERSION1), archive(VERSION2))
        val stateByVersions: Map<String, ScenarioState> = scenario.extractVersionsAndCheckIsNotEmpty()
        assertEquals(2, stateByVersions.size)
        assertEquals(DRAFT, stateByVersions[VERSION1])
        assertEquals(ARCHIVE, stateByVersions[VERSION2])
    }

    @Test
    fun `GIVEN scenario with no version WHEN extractVersionsAndCheckIsNotEmpty THEN exception is thrown`() {
        val scenario = createScenario(ID1)
        assertThrows<ScenarioWithNoVersionIdException> { scenario.extractVersionsAndCheckIsNotEmpty() }
    }

    @Test
    fun `GIVEN scenario with version empty WHEN extractVersionsAndCheckIsNotEmpty THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(null))
        assertThrows<ScenarioWithNoVersionIdException> { scenario.extractVersionsAndCheckIsNotEmpty() }
    }

    @Test
    fun `GIVEN scenario with duplicated version WHEN extractVersionsAndCheckIsNotEmpty THEN exception is thrown`() {
        val scenario = createScenario(ID1, draft(VERSION1), draft(VERSION1))
        assertThrows<DuplicateVersionException> { scenario.extractVersionsAndCheckIsNotEmpty() }
    }

    @Test
    fun `GIVEN scenario is not null WHEN checkIsNotNullForId THEN no exception is thrown`() {
        val scenario = createScenario(null)
        assertDoesNotThrow { scenario.checkNotNullForId("marcus") }
    }

    @Test
    fun `GIVEN scenario is null WHEN checkIsNotNullForId THEN exception is thrown`() {
        val scenario = null
        assertThrows<ScenarioNotFoundException> { scenario.checkNotNullForId("marcus") }
    }

    @Test
    fun `GIVEN scenario id is not null WHEN checkIdNotNull THEN no exception is thrown`() {
        val scenario = createScenario(ID1)
        assertDoesNotThrow { scenario.checkIdNotNull() }
    }

    @Test
    fun `GIVEN scenario id is null WHEN checkIdNotNull THEN exception is thrown`() {
        val scenario = createScenario(null)
        assertThrows<ScenarioWithNoIdException> { scenario.checkIdNotNull() }
    }

    @Test
    fun `GIVEN list of scenario id is not null WHEN checkIdNotNull THEN no exception is thrown`() {
        val scenarios: List<Scenario> = listOf(createScenario(ID1))
        assertDoesNotThrow { scenarios.checkIdNotNull() }
    }

    @Test
    fun `GIVEN list empty of scenario WHEN checkIdNotNull THEN no exception is thrown`() {
        val scenarios: List<Scenario> = emptyList()
        assertDoesNotThrow { scenarios.checkIdNotNull() }
    }

    @Test
    fun `GIVEN list of scenario id is null WHEN checkIdNotNull THEN exception is thrown`() {
        val scenarios: List<Scenario> = listOf(createScenario(ID1), createScenario(null))
        assertThrows<ScenarioWithNoIdException> { scenarios.checkIdNotNull() }
    }

    @Test
    fun `GIVEN list of scenario version contains one verion WHEN checkContainsOneVersion THEN no exception is thrown and return version`() {
        val versions: List<ScenarioVersion> = listOf(draft(VERSION1))
        val version: ScenarioVersion = versions.checkContainsOne()
        assertEquals(VERSION1, version.version)
        assertEquals(DRAFT, version.state)
    }

    @Test
    fun `GIVEN list of scenario version contains multiple verion WHEN checkContainsOneVersion THEN exception is thrown`() {
        val versions: List<ScenarioVersion> = listOf(draft(VERSION1), draft(VERSION2))
        assertThrows<BadNumberException> { versions.checkContainsOne() }
    }

    @Test
    fun `GIVEN list of scenario version empty WHEN checkContainsOneVersion THEN exception is thrown`() {
        val versions: List<ScenarioVersion> = emptyList()
        assertThrows<BadNumberException> { versions.checkContainsOne() }
    }

    @Test
    fun `GIVEN list of scenario result contains one result WHEN checkContainsOneResult THEN no exception is thrown and return version`() {
        val results: List<ScenarioResult> = listOf(createScenarioResult(ID1, VERSION1, DRAFT))
        val result: ScenarioResult = results.checkContainsOne()
        assertEquals(ID1, result.sagaId)
        assertEquals(VERSION1, result.id)
        assertEquals(DRAFT, result.state)
    }

    @Test
    fun `GIVEN list of scenario result contains multiple result WHEN checkContainsOneResult THEN exception is thrown`() {
        val results: List<ScenarioResult> =
            listOf(createScenarioResult(ID1, VERSION1, DRAFT), createScenarioResult(ID1, VERSION2, DRAFT))
        assertThrows<BadNumberException> { results.checkContainsOne() }
    }

    @Test
    fun `GIVEN list of scenario result empty  WHEN checkContainsOneResult THEN exception is thrown`() {
        val results: List<ScenarioResult> = emptyList()
        assertThrows<BadNumberException> { results.checkContainsOne() }
    }

    @Test
    fun `100 per cent coverage`() {
        assertDoesNotThrow { ScenarioPredicate() }
    }

}