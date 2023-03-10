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

import ai.tock.bot.admin.BotAdminService
import ai.tock.shared.security.TockUser
import ai.tock.shared.vertx.WebVerticle
import io.vertx.ext.web.RoutingContext
import mu.KLogger
import mu.KotlinLogging

/**
 * shared methods implementation available to verticles
 */
abstract class AbstractServerVerticle  {

    val logger: KLogger = KotlinLogging.logger {}

    /**
     * Check the bot configuration.
     * Throws [BadRequestException] if there is not a bot found.
     * @param context : the vertx routing context
     * @param botId : id of the bot
     */
    fun checkBotConfiguration(context: RoutingContext, botId: String) {
        val namespace = getNamespace(context)
        val botConfiguration = BotAdminService.getBotConfigurationsByNamespaceAndBotId(namespace, botId).firstOrNull()
        botConfiguration ?: WebVerticle.badRequest("No bot configuration is defined yet")
    }

    /**
     * Get the namespace from the context
     * @param context : the vertx routing context
     */
    fun getNamespace(context: RoutingContext) = (context.user() as TockUser).namespace

    fun RoutingContext.setResponseStatusCode(statusCode: Int) { response().statusCode = statusCode }
}