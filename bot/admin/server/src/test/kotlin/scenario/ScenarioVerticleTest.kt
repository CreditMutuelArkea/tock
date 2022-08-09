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

import ai.tock.bot.admin.model.scenario.ScenarioRequest
import ai.tock.bot.admin.model.scenario.ScenarioResult
import ai.tock.shared.exception.TockException
import ai.tock.shared.tockInternalInjector
import ai.tock.shared.exception.rest.InternalServerException
import ai.tock.shared.exception.rest.NotFoundException
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.KodeinInjector
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.provider
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.vertx.ext.web.RoutingContext
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * ScenarioVerticleTest extends ScenarioVerticle to access and test protected lambdas
 */
class ScenarioVerticleTest : ScenarioVerticle() {

    private val scenarioId = "scenarioID"
    private val ID1 = "id_test_1"
    private val ID2 = "id_test_2"

    private val ROOT_ID = "id_root"

    val routingContext: RoutingContext = mockk(relaxed = true)

    companion object {
        val scenarioService: ScenarioService = mockk()

        init {
            tockInternalInjector = KodeinInjector()
            val module = Kodein.Module {
                bind<ScenarioService>() with provider { scenarioService }
            }
            tockInternalInjector.inject(
                Kodein {
                    import(module)
                }
            )
        }
    }

    @Test
    fun `getAllScenarios WHEN findAll return list of valide scenario THEN return list of ScenarioResult`() {
        //GIVEN
        val ids = listOf(ID1, ID2)
        every {
            scenarioService.findAll()
        } returns
                listOf(
                    createScenario(ID1, ROOT_ID),
                    createScenario(ID2, ROOT_ID)
                )

        //WHEN
        val scenarioResult: List<ScenarioResult> = getAllScenarios.invoke(routingContext)

        //THEN
        assertEquals(2, scenarioResult.size)
        assertTrue { scenarioResult.fold(true) { condition, element -> (condition && ids.contains(element.id)) } }
    }

    @Test
    fun `getAllScenarios WHEN findAll return empty list THEN return empty list`() {
        //GIVEN
        every { scenarioService.findAll() } returns listOf()

        //WHEN
        val scenarioResult: List<ScenarioResult> = getAllScenarios.invoke(routingContext)

        //THEN
        assertTrue { scenarioResult.isEmpty() }
    }

    @Test
    fun `getAllScenarios WHEN findAll return list of invalid scenario THEN throw InternalServerException`() {
        //GIVEN
        every { scenarioService.findAll() } returns listOf(
            createScenario(null),
            createScenario(ID2)
        )

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getAllScenarios.invoke(routingContext) }
        assertEquals("cannot create scenarioResult with id null", exceptionThrows.message)
    }

    @Test
    fun `getAllScenarios WHEN findAll throw tockException THEN throw InternalServerException`() {
        //GIVEN
        val testExceptionMessage: String = "test exception message"
        every { scenarioService.findAll() } throws TockException(testExceptionMessage)
        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getAllScenarios.invoke(routingContext) }
        assertEquals(testExceptionMessage, exceptionThrows.message)
    }

    @Test
    fun `getOneScenario WHEN findById return a valide scenario THEN return ScenarioResult`() {
        val id: String = ID1

        //GIVEN
        val scenario: Scenario = createScenario(id, ROOT_ID)
        every { scenarioService.findById(id) } returns scenario
        every { routingContext.pathParam(scenarioId) } returns id

        //WHEN
        val scenarioResult: ScenarioResult = getOneScenario.invoke(routingContext)

        //THEN
        assertEquals(createScenarioResult(id, ROOT_ID), scenarioResult)
    }

    @Test
    fun `getOneScenario WHEN findById return a scenario with no id and no sagaid THEN throw an internal InternalServerException`() {
        val id: String = ID1

        //GIVEN
        val scenario: Scenario = createScenario(null)
        every { routingContext.pathParam(scenarioId) } returns id
        every { scenarioService.findById(id) } returns scenario

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getOneScenario.invoke(routingContext) }
        assertEquals("cannot create scenarioResult with id null", exceptionThrows.message)
    }

    @Test
    fun `getOneScenario WHEN findById return a scenario with no sagaid THEN throw an internal InternalServerException`() {
        val id: String = ID1

        //GIVEN
        val scenario: Scenario = createScenario(id)
        every { routingContext.pathParam(scenarioId) } returns id
        every { scenarioService.findById(id) } returns scenario

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getOneScenario.invoke(routingContext) }
        assertEquals("cannot create scenarioResult with sagaId null", exceptionThrows.message)
    }

    @Test
    fun `getOneScenario WHEN bad parameter id THEN throw an internal NotFoundException`() {
        //GIVEN
        every { routingContext.pathParam(scenarioId) } returns null

        //WHEN THEN
        val exceptionThrows = assertThrows<NotFoundException> { getOneScenario.invoke(routingContext) }
        assertEquals("scenarioID uri parameter not found", exceptionThrows.message)
    }

    @Test
    fun `getOneScenario WHEN findById throw tockException THEN throw InternalServerException`() {
        //GIVEN
        val testExceptionMessage: String = "test exception message"
        every { routingContext.pathParam(any()) } returns ID1
        every { scenarioService.findById(any()) } throws TockException(testExceptionMessage)

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getOneScenario.invoke(routingContext) }
        assertEquals(testExceptionMessage, exceptionThrows.message)
    }

    @Test
    fun `createScenario WHEN create return a valide scenario THEN return ScenarioResult`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(null)
        val scenarioToCreate: Scenario = createScenario(null)
        val scenarioCreated: Scenario = createScenario(id, ROOT_ID)
        every { scenarioService.create(scenarioToCreate) } returns scenarioCreated

        //WHEN
        val scenarioResult: ScenarioResult = createScenario.invoke(routingContext, scenarioRequest)

        //THEN
        assertEquals(createScenarioResult(id, ROOT_ID), scenarioResult)
    }

    @Test
    fun `createScenario WHEN create return an invalid scenario THEN throw an InternalServerException`() {
        //GIVEN
        val scenarioToCreate: Scenario = createScenario(null)
        val scenarioCreated: Scenario = createScenario(null)
        every { scenarioService.create(scenarioToCreate) } returns scenarioCreated

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> {
            createScenario.invoke(routingContext, createScenarioRequest(null))
        }
        assertEquals("cannot create scenarioResult with id null", exceptionThrows.message)
    }

    @Test
    fun `createScenario WHEN create throw tockException THEN throw InternalServerException`() {
        //GIVEN
        val testExceptionMessage: String = "test exception message"
        every { scenarioService.create(any()) } throws TockException(testExceptionMessage)

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> {
            createScenario.invoke(routingContext, createScenarioRequest(null))
        }
        assertEquals(testExceptionMessage, exceptionThrows.message)
    }

    @Test
    fun `updateScenario WHEN update return a valide scenario THEN return ScenarioResult`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(id, ROOT_ID)
        val scenario: Scenario = createScenario(id, ROOT_ID)
        every { routingContext.pathParam(scenarioId) } returns id
        every { scenarioService.update(id, scenario) } returns scenario

        //WHEN
        val scenarioResult: ScenarioResult = updateScenario.invoke(routingContext, scenarioRequest)

        //THEN
        assertEquals(createScenarioResult(id, ROOT_ID), scenarioResult)
    }

    @Test
    fun `updateScenario WHEN update return an invalid scenario THEN throw an InternalServerException`() {
        val id: String = ID1

        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(null)
        val scenario: Scenario = createScenario(null)
        every { routingContext.pathParam(scenarioId) } returns id
        every { scenarioService.update(id, scenario) } returns scenario

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> {
            updateScenario.invoke(routingContext, scenarioRequest)
        }
        assertEquals("cannot create scenarioResult with id null", exceptionThrows.message)
    }

    @Test
    fun `updateScenario WHEN bad parameter id THEN throw an internal NotFoundException`() {
        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(null)
        every { routingContext.pathParam(scenarioId) } returns null

        //WHEN THEN
        val exceptionThrows = assertThrows<NotFoundException> { updateScenario.invoke(routingContext, scenarioRequest) }
        assertEquals("scenarioID uri parameter not found", exceptionThrows.message)
    }

    @Test
    fun `updateScenario WHEN updateScenario throw tockException THEN throw InternalServerException`() {
        //GIVEN
        val testExceptionMessage: String = "test exception message"
        every { routingContext.pathParam(scenarioId) } returns ID1
        every { scenarioService.update(any(), any()) } throws TockException(testExceptionMessage)

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> {
            updateScenario.invoke(routingContext, createScenarioRequest(ID1))
        }
        assertEquals(testExceptionMessage, exceptionThrows.message)
    }

    @Test
    fun `deleteScenario WHEN update return a valide scenario THEN return ScenarioResult`() {
        val id: String = ID1

        //GIVEN
        every { routingContext.pathParam(scenarioId) } returns id
        every { scenarioService.delete(id) } returns Unit

        //WHEN
        deleteScenario.invoke(routingContext)

        verify(exactly = 1) { scenarioService.delete(id) }
    }

    @Test
    fun `deleteScenario WHEN bad parameter id THEN throw an internal NotFoundException`() {
        //GIVEN
        every { routingContext.pathParam(scenarioId) } returns null

        //WHEN THEN
        val exceptionThrows = assertThrows<NotFoundException> { deleteScenario.invoke(routingContext) }
        assertEquals("scenarioID uri parameter not found", exceptionThrows.message)
    }

    @Test
    fun `deleteScenario WHEN delete throw tockException THEN throw InternalServerException`() {
        //GIVEN
        val testExceptionMessage: String = "test exception message"
        every { routingContext.pathParam(scenarioId) } returns ID1
        every { scenarioService.delete(any()) } throws TockException(testExceptionMessage)

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { deleteScenario.invoke(routingContext) }
        assertEquals(testExceptionMessage, exceptionThrows.message)
    }

    private fun createScenario(id: String?, rootId: String? = null): Scenario {
        return Scenario(id = id, rootId = rootId, name = "test", applicationId = "test", state = ScenarioState.DRAFT)
    }

    private fun createScenarioRequest(id: String?, rootId: String? = null): ScenarioRequest {
        return ScenarioRequest(id = id, sagaId = rootId, name = "test", applicationId = "test", state = ScenarioState.DRAFT)
    }

    private fun createScenarioResult(id: String, rootId: String): ScenarioResult {
        return ScenarioResult(id = id, sagaId = rootId, name = "test", applicationId = "test", state = ScenarioState.DRAFT)
    }
}