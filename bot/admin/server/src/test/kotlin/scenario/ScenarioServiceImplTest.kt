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

import ai.tock.shared.exception.*
import ai.tock.shared.tockInternalInjector
import ai.tock.shared.exception.rest.InternalServerException
import ai.tock.shared.exception.rest.NotFoundException
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

    private val ROOT_ID = "id_root"

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
        every { scenarioDAO.findAll() } returns listOf(createScenario(ID1, ROOT_ID))

        //WHEN
        val scenariosFound = scenarioService.findAll()

        //THEN
        assertEquals(1, scenariosFound.size)
        assertTrue { scenariosFound.fold(true) { condition, element -> (condition && element != null) } }
    }

    @Test
    fun `findAll WHEN dao findAll return list of 1 invalid scenario THEN throw InternalServerException`() {
        //GIVEN
        every { scenarioDAO.findAll() } returns listOf(createScenario(null, null))

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findAll() }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findById WHEN dao findById return a valid scenario THEN return Scenario`() {
        val id: String = ID1

        //GIVEN
        every { scenarioDAO.findById(id) } returns createScenario(id, ROOT_ID)

        //WHEN
        val scenarioFind = scenarioService.findById(id)

        //THEN
        assertEquals(createScenario(id, ROOT_ID), scenarioFind)
    }

    @Test
    fun `findById WHEN dao findAll return list of 1 invalid scenario THEN throw InternalServerException`() {
        val id: String = ID1

        //GIVEN
        every { scenarioDAO.findById(id) } returns createScenario(null, null)

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.findById(id) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `findById WHEN dao findAll return null THEN throw InternalServerException`() {
        val id: String = ID1

        //GIVEN
        every { scenarioDAO.findById(id) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.findById(id) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `create WHEN dao create return a valid scenario THEN return Scenario`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: Scenario = createScenario(null, null)
        val scenarioToCreate: Scenario = createScenario(null, null, dateNow)
        val scenarioCreated: Scenario = createScenario(id, ROOT_ID, dateNow)
        every { scenarioDAO.create(scenarioToCreate) } returns scenarioCreated

        //WHEN
        val scenario = scenarioService.create(scenarioRequest)

        //THEN
        assertEquals(createScenario(id, ROOT_ID, dateNow), scenario)
    }

    @Test
    fun `create WHEN dao create return invalid scenario THEN throw InternalServerException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(null, null)
        val scenarioCreated: Scenario = createScenario(null, null, dateNow)
        every { scenarioDAO.create(scenarioCreated) } returns scenarioCreated

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.create(scenarioRequest) }
        assertEquals("scenario from database cannot have id null", exceptionThrows.message)
    }

    @Test
    fun `create WHEN dao create return null THEN throw InternalServerException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(null, null)
        val scenarioCreated: Scenario = createScenario(null, null, dateNow)
        every { scenarioDAO.create(scenarioCreated) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.create(scenarioRequest) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `create WHEN dao create throw exception THEN throw InternalServerException`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: Scenario = createScenario(id, ROOT_ID)
        every { scenarioDAO.create(scenarioRequest) } throws TockIllegalArgumentException("test_illegal_argument")

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithIdException> { scenarioService.create(scenarioRequest) }
        assertEquals("scenario id is $id", exceptionThrows.message)
    }

    @Test
    fun `update WHEN dao update return a valid scenario THEN return Scenario`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: Scenario = createScenario(id, ROOT_ID)
        val scenarioFind: Scenario = createScenario(id, ROOT_ID, datePrevious, null)
        val scenarioUpdated: Scenario = createScenario(id, ROOT_ID, datePrevious, dateNow)
        every { scenarioDAO.findById(id) } returns scenarioFind
        every { scenarioDAO.update(scenarioUpdated) } returns scenarioUpdated

        //WHEN
        val scenario = scenarioService.update(id, scenarioRequest)

        //THEN
        assertEquals(scenarioUpdated, scenario)
    }

    @Test
    fun `update GIVEN scenario with id different than id on url THEN throw InternalServerException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, ROOT_ID)
        val scenarioFind: Scenario = createScenario(ID2, ROOT_ID)
        every { scenarioDAO.findById(ID2) } returns scenarioFind

        //WHEN //THEN
        val exceptionThrows = assertThrows<BadScenarioIdException> { scenarioService.update(ID2, scenarioRequest) }
        assertEquals("scenario id $ID2 expected, but was $ID1", exceptionThrows.message)
    }

    @Test
    fun `update WHEN dao update return invalid scenario THEN throw InternalServerException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, ROOT_ID)
        val scenarioFind: Scenario = createScenario(ID1, ROOT_ID, datePrevious)
        val scenarioToUpdate: Scenario = createScenario(ID1, ROOT_ID, datePrevious, dateNow)
        val scenarioUpdated: Scenario = createScenario(null, null, datePrevious, dateNow)
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.update(scenarioToUpdate) } returns scenarioUpdated

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioWithNoIdException> { scenarioService.update(ID1, scenarioRequest) }
        assertEquals("scenario id from database cannot be null", exceptionThrows.message)
    }

    @Test
    fun `update WHEN dao update return null THEN throw NotFoundException`() {
        //GIVEN
        val scenarioRequest: Scenario = createScenario(ID1, ROOT_ID)
        val scenarioFind: Scenario = createScenario(ID1, ROOT_ID, datePrevious)
        val scenarioToUpdate: Scenario = createScenario(ID1, ROOT_ID, datePrevious, dateNow)
        every { scenarioDAO.findById(ID1) } returns scenarioFind
        every { scenarioDAO.update(scenarioToUpdate) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> { scenarioService.update(ID1, scenarioRequest) }
        assertEquals("scenario not found", exceptionThrows.message)
    }

    @Test
    fun `update WHEN dao update throw exception THEN throw TockIllegalArgumentException`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: Scenario = createScenario(id, ROOT_ID)
        val scenarioFind: Scenario = createScenario(id, ROOT_ID, datePrevious)
        val scenarioUpdated: Scenario = createScenario(id, ROOT_ID, datePrevious, dateNow)
        every { scenarioDAO.findById(id) } returns scenarioFind
        every { scenarioDAO.update(scenarioUpdated) } throws TockIllegalArgumentException("test_illegal_argument")

        //WHEN //THEN
        val exceptionThrows = assertThrows<TockIllegalArgumentException> { scenarioService.update(id, scenarioRequest) }
        assertEquals("test_illegal_argument", exceptionThrows.message)
    }

    @Test
    fun `update WHEN findById not found THEN throw NotFoundException`() {
        val id: String = ID1

        //GIVEN
        every { scenarioDAO.findById(id) } returns null

        //WHEN //THEN
        val exceptionThrows = assertThrows<ScenarioNotFoundException> {
            scenarioService.update(id, createScenario(id, ROOT_ID))
        }
        assertEquals("$id not found", exceptionThrows.message)
    }

    @Test
    fun `delete GIVEN id of scenario exist THEN scenario is delete`() {
        val id: String = ID1

        //WHEN
        assertDoesNotThrow { scenarioService.delete(id) }

        //THEN
        verify(exactly = 1) { scenarioDAO.delete(any()) }
    }

    @Test
    fun `delete GIVEN id of scenario don't exist THEN nothing`() {
        val id: String = ID2

        //GIVEN
        every { scenarioDAO.delete(id) } throws TockNotFound("test_not_found")

        //WHEN
        assertDoesNotThrow { scenarioService.delete(id) }

        //THEN
        verify(exactly = 1) { scenarioDAO.delete(any()) }
    }

    private fun createScenario(
        id: String?,
        rootId: String? = null,
        createDate: ZonedDateTime? = null,
        updateDate: ZonedDateTime? = null
    ): Scenario {
        return Scenario(
            id = id,
            rootId = rootId,
            name = "test",
            applicationId = "test",
            createDate = createDate,
            updateDate = updateDate,
            state = ScenarioState.DRAFT
        )
    }
}