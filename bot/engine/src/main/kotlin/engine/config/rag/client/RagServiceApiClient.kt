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

package ai.tock.bot.engine.config.rag.client


import ai.tock.bot.engine.config.rag.client.dto.RagQuery
import ai.tock.bot.engine.config.rag.client.dto.RagResult
import ai.tock.shared.addJacksonConverter
import ai.tock.shared.longProperty
import ai.tock.shared.property
import ai.tock.shared.retrofitBuilderWithTimeoutAndLogger
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import mu.KotlinLogging
import retrofit2.Response

class RagServiceApiClient(baseUrl: String = property("tock_rag_client_service_url", "http://localhost:8000")) :
    RagClient {

    private val logger = KotlinLogging.logger {}
    private val service: RagServiceApi

    init {
        val mapper = jacksonObjectMapper()
        mapper.findAndRegisterModules()
        // force java time module
        mapper.registerModule(JavaTimeModule())
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL)
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true)

        val timeout = longProperty("tock_rag_client_request_timeout_ms", 250000)
        val retrofit = retrofitBuilderWithTimeoutAndLogger(timeout, logger)
            .addJacksonConverter(mapper)
            .baseUrl(baseUrl)
            .build()

        service = retrofit.create(RagServiceApi::class.java)
    }

    private fun <T> Response<T>.parseAndReturns(): T? =
        body()
            ?: run {
                logger.error { "ERROR !!! : ${errorBody()?.string()}" }
                null as Nothing?
            }


    override fun ask(query: RagQuery): RagResult? {
        return service.ask(query).execute().parseAndReturns()
    }

}
