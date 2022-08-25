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
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.createScenarioResult
import ai.tock.bot.admin.scenario.ScenarioState.*
import ai.tock.bot.admin.model.scenario.ScenarioRequest
import ai.tock.bot.admin.model.scenario.ScenarioResult
import ai.tock.bot.admin.scenario.ScenarioAbstractTest.Companion.createScenarioRequest
import ai.tock.shared.exception.TockException
import ai.tock.shared.tockInternalInjector
import ai.tock.shared.exception.rest.InternalServerException
import ai.tock.shared.exception.rest.NotFoundException
import ai.tock.shared.exception.scenario.ScenarioNotFoundException
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
    private val sagaId = "sagaID"

    private val ID1 = "id_test_1"
    private val ID2 = "id_test_2"

    private val VERSION1 = "version_test_1"
    private val VERSION2 = "version_test_2"

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
        val versions = listOf(VERSION1, VERSION2)
        every {
            scenarioService.findAll()
        } returns listOf( createScenario(ID1, draft(VERSION1)), createScenario(ID2, draft(VERSION2)) )

        //WHEN
        val scenarioResult: List<ScenarioResult> = getAllScenarios.invoke(routingContext)

        //THEN
        assertEquals(2, scenarioResult.size)
        assertTrue {
            scenarioResult.fold(true) {
                condition, element -> condition && ids.contains(element.sagaId)  && versions.contains(element.id)
            }
        }
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
        every { scenarioService.findAll() } returns listOf(createScenario(null),createScenario(ID2))

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getAllScenarios.invoke(routingContext) }
        assertEquals("scenario must not be empty", exceptionThrows.message)
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
        //GIVEN
        val scenario: Scenario = createScenario(ID1, draft(VERSION1))
        every { scenarioService.findOnlyVersion(ID1) } returns scenario
        every { routingContext.pathParam(scenarioId) } returns ID1

        //WHEN
        val scenarioResult: ScenarioResult = getOneScenario.invoke(routingContext)

        //THEN
        assertEquals(createScenarioResult(ID1, VERSION1, DRAFT), scenarioResult)
    }

    @Test
    fun `getOneScenario WHEN findById return a scenario with no id and no sagaid THEN throw an internal InternalServerException`() {
        //GIVEN
        val scenario: Scenario = createScenario(null)
        every { routingContext.pathParam(scenarioId) } returns ID1
        every { scenarioService.findOnlyVersion(ID1) } returns scenario

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getOneScenario.invoke(routingContext) }
        assertEquals("1 scenario expected but 0 found", exceptionThrows.message)
    }

    @Test
    fun `getOneScenario WHEN findById return a scenario with no sagaid THEN throw an internal InternalServerException`() {
        //GIVEN
        val scenario: Scenario = createScenario(ID1)
        every { routingContext.pathParam(scenarioId) } returns ID1
        every { scenarioService.findOnlyVersion(ID1) } returns scenario

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getOneScenario.invoke(routingContext) }
        assertEquals("1 scenario expected but 0 found", exceptionThrows.message)
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
        every { scenarioService.findOnlyVersion(any()) } throws TockException(testExceptionMessage)

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> { getOneScenario.invoke(routingContext) }
        assertEquals(testExceptionMessage, exceptionThrows.message)
    }

    @Test
    fun `createScenario WHEN create return a valide scenario THEN return ScenarioResult`() {
        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(null)
        val scenarioToCreate: Scenario = createScenario(null, draft(null))
        val scenarioCreated: Scenario = createScenario(ID1, draft(VERSION1))
        every { scenarioService.create(scenarioToCreate) } returns scenarioCreated

        //WHEN
        val scenarioResult: ScenarioResult = createScenario.invoke(routingContext, scenarioRequest)

        //THEN
        assertEquals(createScenarioResult(ID1, VERSION1, DRAFT), scenarioResult)
    }

    @Test
    fun `createScenario WHEN create return an invalid scenario THEN throw an InternalServerException`() {
        //GIVEN
        val scenarioToCreate: Scenario = createScenario(null, draft(null))
        val scenarioCreated: Scenario = createScenario(null, draft(VERSION1))
        every { scenarioService.create(scenarioToCreate) } returns scenarioCreated

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> {
            createScenario.invoke(routingContext, createScenarioRequest(null))
        }
        assertEquals("scenario must have saga id but it's null", exceptionThrows.message)
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
        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(ID1, VERSION1, DRAFT)
        val scenario: Scenario = createScenario(ID1, draft(VERSION1))
        every { routingContext.pathParam(scenarioId) } returns ID1
        every { scenarioService.update(ID1, scenario) } returns scenario

        //WHEN
        val scenarioResult: ScenarioResult = updateScenario.invoke(routingContext, scenarioRequest)

        //THEN
        assertEquals(createScenarioResult(ID1, VERSION1, DRAFT), scenarioResult)
    }

    @Test
    fun `updateScenario WHEN update return an invalid scenario THEN throw an InternalServerException`() {
        //GIVEN
        val scenarioRequest: ScenarioRequest = createScenarioRequest(ID1, VERSION1)
        val scenario: Scenario = createScenario(null, draft(VERSION1))
        every { routingContext.pathParam(scenarioId) } returns VERSION1
        every { scenarioService.update(VERSION1, any()) } returns scenario

        //WHEN THEN
        val exceptionThrows = assertThrows<InternalServerException> {
            updateScenario.invoke(routingContext, scenarioRequest)
        }
        assertEquals("scenario must have saga id but it's null", exceptionThrows.message)
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
    fun `deleteScenario WHEN delete don't throw notfound THEN nothing`() {
        //GIVEN
        every { routingContext.pathParam(sagaId) } returns ID1
        every { scenarioService.deleteById(ID1) } returns Unit

        //WHEN
        deleteScenario.invoke(routingContext)

        verify(exactly = 1) { scenarioService.deleteById(ID1) }
    }

    @Test
    fun `deleteScenario WHEN bad parameter id THEN throw an internal NotFoundException`() {
        //GIVEN
        every { routingContext.pathParam(sagaId) } returns null
        every { scenarioService.deleteById(ID1) } returns Unit

        //WHEN THEN
        val exceptionThrows = assertThrows<NotFoundException> { deleteScenario.invoke(routingContext) }
        assertEquals("sagaID uri parameter not found", exceptionThrows.message)
    }

    @Test
    fun `deleteScenario WHEN deleteByVersion throw tockException THEN throw InternalServerException`() {
        //GIVEN
        every { routingContext.pathParam(sagaId) } returns ID1
        every { scenarioService.deleteById(ID1) } throws ScenarioNotFoundException(ID1, "test exception message")

        //WHEN THEN
        val exceptionThrows = assertThrows<NotFoundException> { deleteScenario.invoke(routingContext) }
        assertEquals("saga $ID1 not found", exceptionThrows.message)
    }
}