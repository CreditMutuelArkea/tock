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

package ai.tock.bot.admin.service

import ai.tock.bot.admin.AbstractTest
import ai.tock.bot.admin.model.BotRAGConfigurationDTO
import ai.tock.llm.orchestrator.client.responses.ErrorInfo
import ai.tock.llm.orchestrator.client.responses.ErrorResponse
import ai.tock.llm.orchestrator.client.responses.ProviderSettingStatusResponse
import ai.tock.llm.orchestrator.client.services.EMProviderService
import ai.tock.llm.orchestrator.client.services.LLMProviderService
import ai.tock.llm.orchestrator.core.models.em.AzureOpenAIEMSetting
import ai.tock.llm.orchestrator.core.models.llm.OpenAILLMSetting
import ai.tock.shared.tockInternalInjector
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.KodeinInjector
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.singleton
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class RagValidationServiceTest {

    companion object {
        init {
            tockInternalInjector = KodeinInjector()
            Kodein.Module {
                bind<LLMProviderService>() with singleton { llmProviderService }
                bind<EMProviderService>() with singleton { emProviderService }
            }.also {
                tockInternalInjector.inject(Kodein {
                    import(it)
                })
            }
        }

        private val llmProviderService: LLMProviderService = mockk(relaxed = false)
        private val emProviderService: EMProviderService = mockk(relaxed = false)
    }

    private val openAILLMSetting = OpenAILLMSetting(
        apiKey = "123-abc", model = "unavailable-model", temperature = "0.4", prompt = "How to bike in the rain"
    )

    private val azureOpenAIEMSetting = AzureOpenAIEMSetting(
        apiKey = "123-abc",
        apiBase = "http://my-api-base-endpoint-url.com",
        apiVersion = "2023-08-01-preview",
        deploymentName = "deploymentName",
    )

    private val ragConfiguration = BotRAGConfigurationDTO(
        namespace = "namespace",
        botId = "botId",
        llmSetting = openAILLMSetting,
        emSetting = azureOpenAIEMSetting,
        noAnswerSentence = " No answer sentence",
    )

    @Test
    fun `validation of the RAG configuration when the Orchestrator returns no error, and the RAG function has been activated, and the session index ID has been supplied`() {

        // GIVEN
        // - No error returned by Generative AI Orchestrator for LLM and EM
        // - Rag enabled
        // - Index session ID is provided
        every {
            llmProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(valid = true, errors = emptyList())
        every {
            emProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(valid = true, errors = emptyList())

        // WHEN :
        // Launch of validation
        val errors = RagValidationService.validate(
            ragConfiguration.copy(enabled = true, indexSessionId = "ABC-123").toBotRAGConfiguration()
        )

        // THEN :
        // Check that no errors have been found
        assertTrue { errors.isEmpty() }
    }

    @Test
    fun `validation of the RAG configuration when the Orchestrator returns no error, and the RAG function has been activated, but no session index ID has been supplied`() {

        // GIVEN
        // - No error returned by Generative AI Orchestrator for LLM and EM
        // - Rag enabled
        // - Index session ID is not provided
        every {
            llmProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(valid = true, errors = emptyList())
        every {
            emProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(valid = true, errors = emptyList())

        // WHEN :
        // Launch of validation
        val errors = RagValidationService.validate(
            ragConfiguration.copy(enabled = true, indexSessionId = null).toBotRAGConfiguration()
        )

        // THEN :
        // Check that one error have been found
        assertEquals(1, errors.size)
        assertEquals("The index session ID is required to enable the RAG feature", errors.first().message)
    }

    @Test
    fun `validation of the RAG configuration when the Orchestrator returns no error, the RAG function has not been activated, and no session index ID has been supplied`() {

        // GIVEN
        // - No error returned by Generative AI Orchestrator for LLM and EM
        // - Rag is not enabled
        // - Index session ID is not provided
        every {
            llmProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(valid = true, errors = emptyList())
        every {
            emProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(valid = true, errors = emptyList())

        // WHEN :
        // Launch of validation
        val errors = RagValidationService.validate(
            ragConfiguration.copy(enabled = false, indexSessionId = null).toBotRAGConfiguration()
        )

        // THEN :
        // Check that no errors have been found
        assertTrue { errors.isEmpty() }
    }

    @Test
    fun `validation of the RAG configuration when the Orchestrator returns 2 errors for LLM and 1 for Embedding model, the RAG function has not been activated`() {

        // GIVEN
        // - 3 errors returned by Generative AI Orchestrator for LLM (2) and EM (1)
        // - Rag is not enabled
        every {
            llmProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(
            valid = false, errors = listOf(
                createFakeErrorResponse("10"), createFakeErrorResponse("20")
            )
        )
        every {
            emProviderService.checkSetting(any())
        } returns ProviderSettingStatusResponse(
            valid = false, errors = listOf(
                createFakeErrorResponse("30")
            )
        )

        // WHEN :
        // Launch of validation
        val errors = RagValidationService.validate(
            ragConfiguration.copy(enabled = false).toBotRAGConfiguration()
        )

        // THEN :
        // Check that 3 errors have been found
        assertEquals(2, errors.size)
        assertEquals("10", (((errors.elementAt(0).params) as List<*>)[0] as ErrorResponse).code)
        assertEquals("20", (((errors.elementAt(0).params) as List<*>)[1] as ErrorResponse).code)
        assertEquals("30", (((errors.elementAt(1).params) as List<*>)[0] as ErrorResponse).code)
    }

    private fun createFakeErrorResponse(code: String) = ErrorResponse(
        code = code,
        message = "message",
        detail = "detail",
        info = ErrorInfo(provider = "provider", error = "error", cause = "cause", request = "request")
    )
}