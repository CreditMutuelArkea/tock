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

package ai.tock.bot.admin.verticle

import ai.tock.bot.admin.indicators.IndicatorError
import ai.tock.bot.admin.model.Valid
import ai.tock.bot.admin.model.ValidationError
import ai.tock.bot.admin.model.indicator.SaveIndicatorRequest
import ai.tock.bot.admin.model.indicator.UpdateIndicatorRequest
import ai.tock.bot.admin.service.IndicatorService
import ai.tock.nlp.front.client.FrontClient
import ai.tock.nlp.front.shared.config.ApplicationDefinition
import ai.tock.shared.exception.rest.UnauthorizedException
import ai.tock.shared.security.TockUserRole
import ai.tock.shared.vertx.WebVerticle
import com.fasterxml.jackson.databind.ObjectMapper
import io.vertx.ext.web.RoutingContext

class IndicatorVerticle : AbstractServerVerticle() {

    companion object {
        const val PATH_PARAM_APPLICATION_NAME = "applicationName"
        const val PATH_PARAM_NAME = "name"
        const val PATH_PARAM_ID = "id"
        const val BASE_PATH = "/indicator"
        const val INDICATOR_BY_APPLICATION_NAME_PATH = "$BASE_PATH/:$PATH_PARAM_APPLICATION_NAME"
        const val BY_APPLICATION_NAME_AND_BY_NAME_PATH = "$BASE_PATH/:$PATH_PARAM_APPLICATION_NAME/:$PATH_PARAM_NAME"
        const val DELETE_PATH = "$BASE_PATH/:$PATH_PARAM_ID"
    }

    private val front = FrontClient

    fun configure(webVerticle: WebVerticle) {
        val authorizedRoles = setOf(TockUserRole.botUser, TockUserRole.admin, TockUserRole.technicalAdmin)

        with(webVerticle) {

            /**
             * lamdba calling database to retrieve application definition from request context
             * @return [ApplicationDefinition]
             */
            val currentContextApp: (RoutingContext) -> ApplicationDefinition? =
                { context ->
                    if(context.pathParam(PATH_PARAM_APPLICATION_NAME).isNotBlank()) {
                        front.getApplicationByNamespaceAndName(
                            getNamespace(context),
                            context.pathParam(PATH_PARAM_APPLICATION_NAME)
                        )
                    } else{
                        logger.error { "Could not find empty application name" }
                        WebVerticle.notFound()
                    }
                }

            blockingJsonPost(
                INDICATOR_BY_APPLICATION_NAME_PATH,
                authorizedRoles
            ) { context: RoutingContext, request: SaveIndicatorRequest ->
                checkNamespaceAndExecute(context, currentContextApp) {
                    tryExecute(context) {
                        logger.info { "saving new indicator ${request.name}" }
                        IndicatorService.save(it.name, Valid(request))
                    }
                }
                return@blockingJsonPost request
            }

            blockingJsonPut(
                BY_APPLICATION_NAME_AND_BY_NAME_PATH,
                authorizedRoles
            ) { context: RoutingContext, request: UpdateIndicatorRequest ->
                checkNamespaceAndExecute(context, currentContextApp) {
                    val name = context.path(PATH_PARAM_NAME)
                    tryExecute(context) {
                        logger.info { "updating indicator $name" }
                        IndicatorService.update(it.name, name, Valid(request))
                    }
                }
                return@blockingJsonPut request
            }

            blockingJsonGet(BY_APPLICATION_NAME_AND_BY_NAME_PATH, authorizedRoles) { context ->
                checkNamespaceAndExecute(context, currentContextApp) {
                    val name = context.path(PATH_PARAM_NAME)
                    tryExecute(context) {
                        logger.info { "deleting indicator $name" }
                        IndicatorService.findByNameAndBotId(name, it.name)
                    }
                }
            }

            blockingJsonGet(INDICATOR_BY_APPLICATION_NAME_PATH, authorizedRoles) { context: RoutingContext ->
                checkNamespaceAndExecute(context, currentContextApp) {
                    tryExecute(context) {
                        logger.info { "retrieve indicators from ${it.name}" }
                        IndicatorService.findAllByBotId(it.name)
                    }
                }
            }

            blockingJsonGet(BASE_PATH, authorizedRoles) { _: RoutingContext ->
                logger.info { "retrieve all indicators" }
                IndicatorService.findAll()
            }

            blockingJsonDelete(DELETE_PATH, authorizedRoles) { context: RoutingContext ->
                val id = context.path(PATH_PARAM_ID)
                tryExecute(context) {
                    IndicatorService.deleteById(id)
                } ?: false
            }
        }
    }
}

/**
 * Check the app requested is found to execute the request
 * @param context [RoutingContext] the request context
 * @param applicationDefinition the application definition retrieved from [context][RoutingContext]
 * @param block the code block invoke after check is OK
 * @throws [UnauthorizedException] if context check is KO
 *
 */
private fun <T> WebVerticle.checkNamespaceAndExecute(
    context: RoutingContext,
    applicationDefinition: (RoutingContext) -> ApplicationDefinition?,
    block: (ApplicationDefinition) -> T
): T? {
    val appFound = applicationDefinition.invoke(context)
    return if (context.organization == appFound?.namespace) {
        block.invoke(appFound)
    } else {
        WebVerticle.unauthorized()
    }
}

data class ErrorMessage(val message: String? = "Unexpected error occurred")

/**
 * try to execute [block] code otherwise throw an exception and set the status code
 * @param context [RoutingContext] request context to be set
 * @param block code block invoked
 */
private fun <T> tryExecute(context: RoutingContext, block: () -> T): T? {
    return try {
        block.invoke()
    } catch (e: Exception) {

        val statusCode = when (e) {
            is ValidationError -> 400
            is IndicatorError.IndicatorDeletionFailed -> 409
            is IndicatorError.IndicatorAlreadyExists -> 409
            is IndicatorError.IndicatorNotFound -> 404
            else -> 500
        }

        context.response()
            .setStatusCode(statusCode)
            .end(ObjectMapper().writeValueAsString(ErrorMessage(e.message)))

        null
    }
}