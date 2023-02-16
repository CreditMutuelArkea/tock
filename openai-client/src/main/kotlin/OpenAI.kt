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

import internal.OpenAIApi
import internal.createHttpClient
import internal.http.HttpTransport

/**
 * OpenAI API.
 */
interface OpenAI : Completions

/**
 * Creates an instance of [OpenAI].
 *
 * @param token secret API key
 */
fun OpenAI(token: String): OpenAI {
    val config = OpenAIConfig(token = token)
    return OpenAI(config)
}

/**
 * Creates an instance of [OpenAI].
 *
 * @param config client config
 */
fun OpenAI(config: OpenAIConfig): OpenAI {
    val httpClient = createHttpClient(config)
    val transport = HttpTransport(httpClient)
    return OpenAIApi(transport)
}
