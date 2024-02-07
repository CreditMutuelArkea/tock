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
package ai.tock.bot.engine

import ai.tock.bot.definition.ConnectorHandlerProvider
import ai.tock.bot.definition.DefaultConnectorHandlerProvider
import ai.tock.bot.engine.nlp.Nlp
import ai.tock.bot.engine.nlp.NlpController
import ai.tock.genai.orchestratorclient.services.EMProviderService
import ai.tock.genai.orchestratorclient.services.LLMProviderService
import ai.tock.genai.orchestratorclient.services.RAGService
import ai.tock.genai.orchestratorclient.services.impl.EMProviderServiceImpl
import ai.tock.genai.orchestratorclient.services.impl.LLMProviderServiceImpl
import ai.tock.genai.orchestratorclient.services.impl.RAGServiceImpl
import ai.tock.nlp.api.client.NlpClient
import ai.tock.nlp.api.client.TockNlpClient
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.provider
import com.github.salomonbrys.kodein.singleton

/**
 * The bot ioc module.
 */
val botModule = Kodein.Module {
    bind<NlpClient>() with singleton { TockNlpClient() }
    bind<NlpController>() with singleton { Nlp() }
    bind<ConnectorHandlerProvider>() with provider { DefaultConnectorHandlerProvider }
    bind<LLMProviderService>() with singleton { LLMProviderServiceImpl() }
    bind<EMProviderService>() with singleton { EMProviderServiceImpl() }
    bind<RAGService>() with singleton { RAGServiceImpl() }
}
