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

package ai.tock.bot.llm.rag.core.client

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
import ai.tock.bot.llm.rag.core.client.models.RagQuery
import ai.tock.bot.llm.rag.core.client.models.RagResult


internal interface RagService {

    @POST("ask/v2")
    fun ask(@Body query: RagQuery): Call<RagResult>

}
