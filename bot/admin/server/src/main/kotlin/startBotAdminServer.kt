/*
 * Copyright (C) 2017/2021 e-voyageurs technologies
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

package ai.tock.bot.admin

import ai.tock.bot.BotIoc
import ai.tock.bot.connector.iadvize.graphql.IadvizeGraphQLClient
import ai.tock.nlp.front.ioc.FrontIoc
import ai.tock.shared.vertx.vertx
import com.github.salomonbrys.kodein.Kodein
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        IadvizeGraphQLClient().isRuleAvailable("7eb4f902-e6e8-4dee-aae1-0e6bef30bdc0")
    }.let { println(it) }

    startAdminServer()
}

fun startAdminServer(vararg modules: Kodein.Module) {
    // setup ioc
    FrontIoc.setup(BotIoc.coreModules + modules.toList())
    // deploy verticle
    vertx.deployVerticle(BotAdminVerticle())
}
