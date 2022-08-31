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

import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.createScenario
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.draft
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.current
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.archive
import ai.tock.shared.exception.scenario.*
import ai.tock.shared.tockInternalInjector
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.KodeinInjector
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.provider
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import java.time.ZonedDateTime
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ScenarioServiceImplTest {

    private val ID1 = "id_test_1"
    private val ID2 = "id_test_2"

    private val VERSION1 = "version_test_1"
    private val VERSION2 = "version_test_2"
    private val VERSION3 = "version_test_3"
    private val VERSION4 = "version_test_4"
    private val VERSION5 = "version_test_5"
    private val VERSION6 = "version_test_6"

    private val datePrevious = ZonedDateTime.parse("2021-01-01T00:00:00+01:00")
    private val dateNow = ZonedDateTime.parse("2022-01-01T00:00:00+01:00")

    val scenarioService = ScenarioServiceImpl()

    companion object {

        val scenarioDAO: ScenarioDAO = mockk(relaxed = true)

        init {
            tockInternalInjector = KodeinInjector()
            val module = Kodein.Module {
                bind<ScenarioDAO>() with provider { scenarioDAO }
            }
            tockInternalInjector.inject(
                Kodein {
                    import(module)
                }
            )
        }
    }

    @BeforeEach
    fun prepareMockk() {
        mockkStatic(ZonedDateTime::class)
        every { ZonedDateTime.now() } returns dateNow
    }

    @AfterEach
    fun clearMockk() {
        clearAllMocks()
    }

    @Test
    fun `findAll WHEN dao findAll return list of 1 valid scenario THEN return a list with 1 Scenario`() {
        //GIVEN
        every { scenarioDAO.findAll() } returns listOf(createScenario(ID1, draft(VERSION1)))

        //WHEN
        val scenariosFound = scenarioService.findAll()

        //THEN
        assertEquals(1, scenariosFound.size)
        assertTrue { scenariosFound.fold(true) { condition, element -> (condition && element != null) } }
    }

    @Test
    fun `findAll WHEN dao findAll return list of 1 invalid scenario THEN throw InternalServerException`() {
        //GIVEN
        every { scenarioDAO.findAll() } returns listOf(createScenario(null, draft(null)))

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findAll() }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findAllActive WHEN dao findAll return list of many valid scenario with archived THEN return a list with Scenario not archived`() {
        //GIVEN
        every { scenarioDAO.findAll() } returns listOf(
            createScenario(ID1, draft(VERSION1), current(VERSION2), archive(VERSION3)),
            createScenario(ID2, draft(VERSION4), archive(VERSION5), archive(VERSION6)),
        )

        //WHEN
        val scenariosFound = scenarioService.findAllActive()

        //THEN
        assertEquals(2, scenariosFound.size)
        assertEquals(2, scenariosFound.elementAt(0).versions.size)
        assertEquals(1, scenariosFound.elementAt(1).versions.size)
    }

    @Test
    fun `findOnlyVersion WHEN dao findByVersion return scenario with one version THEN return Scenario`() {
        //GIVEN
        val scenario = createScenario(ID1, draft(VERSION1))
        every { scenarioDAO.findByVersion(VERSION1) } returns scenario

        //WHEN
        val scenarioFind = scenarioService.findOnlyVersion(VERSION1)

        //THEN
        assertEquals(scenario, scenarioFind)
    }

    @Test
    fun `findOnlyVersion WHEN dao findByVersion return scenario with two different version THEN return Scenario`() {
        //GIVEN
        val scenarioExpected = createScenario(ID1, draft(VERSION1))
        val scenarioFind = createScenario(ID1, draft(VERSION1), current(VERSION2))
        every { scenarioDAO.findByVersion(VERSION1) } returns scenarioFind

        //WHEN
        val scenarioReturn = scenarioService.findOnlyVersion(VERSION1)

        //THEN
        assertEquals(scenarioExpected, scenarioReturn)
    }

    @Test
    fun `findOnlyVersion WHEN dao findByVersion return list of 1 invalid scenario THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findByVersion(VERSION1) } returns createScenario(null)

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findOnlyVersion(VERSION1) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findOnlyVersion WHEN dao findByVersion return null THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findByVersion(VERSION1) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.findOnlyVersion(VERSION1) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `findById WHEN dao findById return scenario with one version THEN return Scenario`() {
        //GIVEN
        val scenario = createScenario(ID1, draft(VERSION1))
        every { scenarioDAO.findById(VERSION1) } returns scenario

        //WHEN
        val scenarioFind = scenarioService.findById(VERSION1)

        //THEN
        assertEquals(scenario, scenarioFind)
    }

    @Test
    fun `findById WHEN dao findById return list of 1 invalid scenario THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findById(VERSION1) } returns createScenario(null)

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findById(VERSION1) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findById WHEN dao findById return null THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findById(VERSION1) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.findById(VERSION1) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `findCurrentById WHEN dao findById return scenario with one version THEN return Scenario`() {
        //GIVEN
        val scenario = createScenario(ID1, current(VERSION1))
        every { scenarioDAO.findById(ID1) } returns scenario

        //WHEN
        val scenarioFind = scenarioService.findCurrentById(ID1)

        //THEN
        assertEquals(scenario, scenarioFind)
    }

    @Test
    fun `findCurrentById WHEN dao findById return scenario with two different version THEN return Scenario`() {
        //GIVEN
        val scenarioExpected = createScenario(ID1, current(VERSION2))
        val scenarioFind = createScenario(ID1, draft(VERSION1), current(VERSION2))
        every { scenarioDAO.findById(ID1) } returns scenarioFind

        //WHEN
        val scenarioReturn = scenarioService.findCurrentById(ID1)

        //THEN
        assertEquals(scenarioExpected, scenarioReturn)
    }

    @Test
    fun `findCurrentById WHEN dao findById return 1 invalid scenario THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findById(ID1) } returns createScenario(null)

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findCurrentById(ID1) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findCurrentById WHEN dao findById return null THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findById(ID1) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.findCurrentById(ID1) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `findActiveById WHEN dao findById return scenario with one version THEN return Scenario`() {
        //GIVEN
        val scenario = createScenario(ID1, current(VERSION1))
        every { scenarioDAO.findById(ID1) } returns scenario

        //WHEN
        val scenarioFind = scenarioService.findActiveById(ID1)

        //THEN
        assertEquals(scenario, scenarioFind)
    }

    @Test
    fun `findActiveById WHEN dao findById return scenario with tree different version that one is archive THEN return Scenario`() {
        //GIVEN
        val scenarioExpected = createScenario(ID1, draft(VERSION1), current(VERSION2))
        val scenarioFind = createScenario(ID1, draft(VERSION1), current(VERSION2), archive(VERSION3))
        every { scenarioDAO.findById(ID1) } returns scenarioFind

        //WHEN
        val scenarioReturn = scenarioService.findActiveById(ID1)

        //THEN
        assertEquals(scenarioExpected, scenarioReturn)
    }

    @Test
    fun `findActiveById WHEN dao findById return 1 invalid scenario THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findById(ID1) } returns createScenario(null)

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findActiveById(ID1) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findActiveById WHEN dao findById return null THEN throw ScenarioException`() {
        //GIVEN
        every { scenarioDAO.findById(ID1) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.findActiveById(ID1) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `create WHEN dao create return a valid scenario THEN return Scenario`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(null, draft(null))
        val scenarioToCreate: Scenario = createScenario(null, draft(null, dateNow))
        val scenarioCreated: Scenario = createScenario(ID1, draft(VERSION1, dateNow))
        every { scenarioDAO.create(scenarioToCreate) } returns scenarioCreated

        //WHEN
        val scenario = scenarioService.create(scenarioRequest)

        //THEN
        assertEquals(scenarioCreated, scenario)
    }

    @Test
    fun `create WHEN existing version in database and dao create return a valid scenario THEN return Scenario`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, draft(null))
        val scenarioFind: Scenario = createScenario(ID1, current(VERSION2, dateNow))
        val scenarioToCreate: Scenario = createScenario(ID1, current(VERSION2, dateNow), draft(null, dateNow))
        val scenarioCreated: Scenario = createScenario(ID1, draft(VERSION1, dateNow), current(VERSION2, dateNow))
        val scenarioExpected: Scenario = createScenario(ID1, draft(VERSION1, dateNow))
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.patch(scenarioToCreate) } returns scenarioCreated

        //WHEN
        val scenario = scenarioService.create(scenarioRequest)

        //THEN
        assertEquals(scenarioExpected, scenario)
    }

    @Test
    fun `create WHEN dao create return invalid scenario THEN throw ScenarioException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(null, draft(null))
        val scenarioCreated: Scenario = createScenario(null, draft(null, dateNow))
        val scenarioFind: Scenario = createScenario(ID1)
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.create(scenarioCreated) } returns scenarioCreated

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.create(scenarioRequest) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `create WHEN dao create return null THEN throw ScenarioException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(null, draft(null))
        val scenarioCreated: Scenario = createScenario(null, draft(null, dateNow))
        val scenarioFind: Scenario = createScenario(ID1)
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.create(scenarioCreated) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.create(scenarioRequest) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `update WHEN dao update return a valid scenario THEN return Scenario`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFind: Scenario = createScenario(ID1, draft(VERSION1, datePrevious, null))
        val scenarioUpdated: Scenario = createScenario(ID1, draft(VERSION1, datePrevious, dateNow))
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.update(scenarioUpdated) } returns scenarioUpdated

        //WHEN
        val scenario = scenarioService.update(VERSION1, scenarioRequest)

        //THEN
        assertEquals(scenarioUpdated, scenario)
    }

    @Test
    fun `update WHEN new is current and existing a current in saga THEN existing become archive and return Scenario`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, current(VERSION1))
        val scenarioFind: Scenario = createScenario(ID1, draft(VERSION1, datePrevious, null), current(VERSION2), archive(VERSION3))
        val scenarioUpdated: Scenario = createScenario(ID1, archive(VERSION2), archive(VERSION3), current(VERSION1, datePrevious, dateNow))
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.update(scenarioUpdated) } returns scenarioUpdated // List of version can be inverted so don't check parameter

        val scenarioExpected: Scenario = createScenario(ID1, current(VERSION1, datePrevious, dateNow))

        //WHEN
        val scenario = scenarioService.update(VERSION1, scenarioRequest)

        //THEN
        assertEquals(scenarioExpected, scenario)
    }

    @Test
    fun `update GIVEN scenario with id different than id on database for version THEN throw ScenarioException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFind: Scenario = createScenario(ID1)
        every { scenarioDAO.findById(ID1) } returns scenarioFind

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.update(VERSION1, scenarioRequest) }
    }

    @Test
    fun `update WHEN dao update return invalid scenario THEN throw ScenarioException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFind: Scenario = createScenario(ID1, draft(VERSION1, datePrevious))
        val scenarioToUpdate: Scenario = createScenario(ID1, draft(VERSION1, datePrevious, dateNow))
        val scenarioUpdated: Scenario = createScenario(null, draft(null, datePrevious, dateNow))
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.update(scenarioToUpdate) } returns scenarioUpdated

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.update(VERSION1, scenarioRequest) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `update WHEN dao update return null THEN throw NotFoundException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, draft(VERSION1))
        val scenarioFind: Scenario = createScenario(ID1, draft(VERSION1, datePrevious))
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.update(any()) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.update(VERSION1, scenarioRequest) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `update WHEN findById not found THEN throw NotFoundException`() {
        //GIVEN
        every { scenarioDAO.findById(ID1) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> {
            scenarioService.update(VERSION1, createScenario(ID1, draft(VERSION1)))
        }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `deleteById GIVEN id of scenario exist THEN scenario is delete`() {
        //WHEN
        assertDoesNotThrow { scenarioService.deleteById(ID1) }

        //THEN
        verify(exactly = 1) { scenarioDAO.delete(any()) }
    }

    @Test
    fun `deleteById GIVEN id of scenario don't exist THEN nothing`() {
        //GIVEN
        every { scenarioDAO.delete(ID2) } throws ScenarioNotFoundException(ID2, "test_not_found")

        //WHEN
        assertDoesNotThrow { scenarioService.deleteById(ID2) }

        //THEN
        verify(exactly = 1) { scenarioDAO.delete(any()) }
    }


    @Test
    fun `deleteByVersion GIVEN version of scenario that have one version THEN scenario is delete`() {
        //GIVEN
        every { scenarioDAO.findByVersion(VERSION1) } returns createScenario(ID1, draft(VERSION1))

        //WHEN
        assertDoesNotThrow { scenarioService.deleteByVersion(VERSION1) }

        //THEN
        verify(exactly = 1) { scenarioDAO.delete(any()) }
    }

    @Test
    fun `deleteByVersion GIVEN version of scenario that have many version THEN scenario is update with version removed`() {
        //GIVEN
        every { scenarioDAO.findByVersion(VERSION1) } returns createScenario(ID1, draft(VERSION1), draft(VERSION2))

        //WHEN
        assertDoesNotThrow { scenarioService.deleteByVersion(VERSION1) }

        //THEN
        verify(exactly = 1) { scenarioDAO.update(createScenario(ID1, draft(VERSION2))) }
    }

    @Test
    fun `deleteByVersion GIVEN version of scenario don't exist THEN nothing`() {
        //GIVEN
        every { scenarioDAO.findByVersion(VERSION2) } throws ScenarioNotFoundException(VERSION1, "test_not_found")

        //WHEN
        assertDoesNotThrow { scenarioService.deleteByVersion(VERSION2) }

        //THEN
        verify(exactly = 0) { scenarioDAO.delete(any()) }
    }
}