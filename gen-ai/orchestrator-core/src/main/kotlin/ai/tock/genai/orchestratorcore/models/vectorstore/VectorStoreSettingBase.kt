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

package ai.tock.genai.orchestratorcore.models.vectorstore


import ai.tock.genai.orchestratorcore.models.Constants
import ai.tock.genai.orchestratorcore.models.security.SecretKey
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "provider"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = OpenSearchVectorStoreSetting::class, name = Constants.OPEN_SEARCH)
)
abstract class VectorStoreSettingBase<T>(
    val provider: VectorStoreProvider,
    open val indexName: String,
    open var indexSessionId: String? = null,
    open val k: String,
) {
    abstract fun copyWithIndexSessionId(indexSessionId: String): VectorStoreSettingBase<T>
}

typealias VectorStoreSettingDTO = VectorStoreSettingBase<String>
typealias VectorStoreSetting = VectorStoreSettingBase<SecretKey>
