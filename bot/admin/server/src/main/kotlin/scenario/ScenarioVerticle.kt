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
import ai.tock.bot.admin.scenario.ScenarioMapper.Companion.toScenarioResults
import ai.tock.bot.admin.scenario.ScenarioMapper.Companion.toScenario
import ai.tock.bot.admin.scenario.ScenarioPredicate.Companion.checkContainsOne
import ai.tock.shared.injector
import ai.tock.shared.security.TockUserRole.*
import ai.tock.shared.exception.rest.NotFoundException
import ai.tock.shared.vertx.WebVerticle
import com.github.salomonbrys.kodein.instance
import io.vertx.ext.web.RoutingContext
import mu.KLogger
import mu.KotlinLogging

/**
 * ScenarioVerticle contains all the routes and actions associated with the scenarios
 */
open class ScenarioVerticle {

    private val logger: KLogger = KotlinLogging.logger {}

    private val exceptionManager = ScenarioExceptionManager(logger)

    private val scenarioService: ScenarioService by injector.instance()

    private val scenarioId = "scenarioID"

    private val sagaId = "sagaID"

    //scenarioBasePath is empty value is necessary so that the scenario URLs are not preceded by
    // the default basePath (/rest/admin) of the BotAdminVerticle on which the routes are added
    private val scenarioBasePath = ""

    private val scenariosPath = "/scenarios"

    private val sagaPath = "/sagas"

    /**
     * Declaration of routes and association to the appropriate handler
     */
    fun configureScenario(webVerticle: WebVerticle) {
        logger.info { "configure ScenarioVerticle" }
        with(webVerticle) {
            blockingJsonGet(scenariosPath, setOf(botUser), handler = getAllScenarios)

            blockingJsonGet("$scenariosPath/active", setOf(botUser), handler = getAllScenariosActive)

            blockingJsonGet("$sagaPath/:$sagaId", setOf(botUser), handler = getAllScenariosFromSaga)

            blockingJsonGet("$scenariosPath/:$scenarioId", setOf(botUser), handler = getOneScenario)

            blockingJsonGet("$sagaPath/:$sagaId/current", setOf(botUser), handler = getCurrentScenariosFromSaga)

            blockingJsonGet("$sagaPath/:$sagaId/active", setOf(botUser), handler = getActivesScenariosFromSaga)

            blockingJsonPost(scenariosPath, setOf(botUser), handler = createScenario)

            blockingJsonPut("$scenariosPath/:$scenarioId", setOf(botUser), handler = updateScenario)

            blockingDeleteEmptyResponse("$scenariosPath/:$scenarioId", setOf(botUser), handler = deleteVersion)

            blockingDeleteEmptyResponse("$sagaPath/:$sagaId", setOf(botUser), handler = deleteScenario)
        }
    }

    /**
     * Handler to retrieve Scenarios, then format the response as a List of ScenarioResult.
     * when success, return a 200 response.
     */
    protected val getAllScenarios: (RoutingContext) -> List<ScenarioResult> = { context ->
        logger.debug { "request to get all scenarios" }
        exceptionManager.catch {
            scenarioService
                .findAll()
                .map(toScenarioResults)
                .flatten()
        }
    }

    /**
     * Handler to retrieve Scenarios draft and current, but no archive,
     * then format the response as a List of ScenarioResult.
     * when success, return a 200 response.
     */
    protected val getAllScenariosActive: (RoutingContext) -> List<ScenarioResult> = { context ->
        logger.debug { "request to get all active scenarios" }
        exceptionManager.catch {
            scenarioService
                .findAllActive()
                .map(toScenarioResults)
                .flatten()
        }
    }

    /**
     * Handler to retrieve Scenarios of a saga, then format the response as a List of ScenarioResult.
     * when success, return a 200 response.
     */
    protected val getAllScenariosFromSaga: (RoutingContext) -> Collection<ScenarioResult> = { context ->
        val sagaId = extractSagaId(context)
        logger.debug { "request to get all scenario from saga $sagaId" }
        exceptionManager.catch {
            scenarioService
                .findById(sagaId)
                .toScenarioResults()
        }
    }

    /**
     * Handler to find and retrieve a Scenario based on it's ID, then format the response as a ScenarioResult.
     * when success, return a 200 response.
     */
    protected val getOneScenario: (RoutingContext) -> ScenarioResult = { context ->
        val scenarioId = extractScenarioId(context)
        logger.debug { "request to get scenario $scenarioId" }
        //return
        exceptionManager.catch {
            scenarioService
                .findOnlyVersion(scenarioId)
                .toScenarioResults()
                .checkContainsOne()
        }
    }

    /**
     * Handler to find and retrieve current Scenario of a saga ID, then format the response as a ScenarioResult.
     * when success, return a 200 response.
     */
    protected val getCurrentScenariosFromSaga: (RoutingContext) -> ScenarioResult = { context ->
        val sagaId = extractSagaId(context)
        logger.debug { "request to get current scenario from saga $sagaId" }
        //return
        exceptionManager.catch {
            scenarioService
                .findCurrentById(sagaId)
                .toScenarioResults()
                .checkContainsOne()
        }
    }

    /**
     * Handler to find and retrieve a Scenario based on it's ID, then format the response as a ScenarioResult.
     * when success, return a 200 response.
     */
    protected val getActivesScenariosFromSaga: (RoutingContext) -> Collection<ScenarioResult>  = { context ->
        val sagaId = extractSagaId(context)
        logger.debug { "request to get active scenarios from saga $sagaId" }
        //return
        exceptionManager.catch {
            scenarioService
                .findActiveById(sagaId)
                .toScenarioResults()
        }
    }

    /**
     * Handler to create and retrieve the Scenario created, then format the response as a ScenarioResult.
     * when success, return a 201 response.
     */
    protected val createScenario: (RoutingContext, ScenarioRequest) -> ScenarioResult = { context, request ->
        logger.debug { "request to create scenario name ${request.name}" }
        context.setResponseStatusCode(201)
        //return
        exceptionManager.catch {
            scenarioService
                .create(request.toScenario())
                .toScenarioResults()
                .checkContainsOne()
        }
    }

    /**
     * Handler to update and retrieve the Scenario update, then format the response as a ScenarioResult.
     * when success, produce a 202 response.
     */
    protected val updateScenario: (RoutingContext, ScenarioRequest) -> ScenarioResult = { context, request ->
        val scenarioId = extractScenarioId(context)
        logger.debug { "request to update scenario $scenarioId" }
        context.setResponseStatusCode(200)
        //return
        exceptionManager.catch {
            scenarioService
                .update(scenarioId, request.toScenario())
                .toScenarioResults()
                .checkContainsOne()
        }
    }

    private fun RoutingContext.setResponseStatusCode(statusCode: Int) {
        response().statusCode = statusCode
    }

    /**
     * Handler to delete a Scenario based on it's ID, then return nothing.
     * when success, produce a 204 response.
     */
    protected val deleteVersion: (RoutingContext) -> Unit = { context ->
        val scenarioId = extractScenarioId(context)
        logger.debug { "request to delete scenario $scenarioId" }
        //no return
        exceptionManager.catch {
            scenarioService.deleteByVersion(scenarioId)
        }
    }

    /**
     * Handler to delete a Scenario based on it's ID, then return nothing.
     * when success, produce a 204 response.
     */
    protected val deleteScenario: (RoutingContext) -> Unit = { context ->
        val sagaId = extractSagaId(context)
        logger.debug { "request to delete all scenario of saga $scenarioId" }
        //no return
        exceptionManager.catch {
            scenarioService.deleteById(sagaId)
        }
    }

    private fun extractScenarioId(context: RoutingContext): String {
        return context.pathParam(scenarioId).checkParameterExist(scenarioId)
    }

    private fun extractSagaId(context: RoutingContext): String {
        return context.pathParam(sagaId).checkParameterExist(sagaId)
    }

    private val checkParameterExist: String?.(String) -> String = { parameter ->
        this ?: throw NotFoundException("$parameter uri parameter not found")
    }
}