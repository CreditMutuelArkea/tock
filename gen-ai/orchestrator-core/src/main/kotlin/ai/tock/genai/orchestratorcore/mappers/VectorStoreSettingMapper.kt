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

package ai.tock.genai.orchestratorcore.mappers

import ai.tock.genai.orchestratorcore.models.vectorstore.OpenSearchVectorStoreSetting
import ai.tock.genai.orchestratorcore.models.vectorstore.PGVectorStoreSetting
import ai.tock.genai.orchestratorcore.models.vectorstore.VectorStoreSetting
import ai.tock.genai.orchestratorcore.models.vectorstore.VectorStoreSettingDTO
import ai.tock.genai.orchestratorcore.utils.SecurityUtils

/**
 * The Vector Store Setting Mapper
 */
object VectorStoreSettingMapper {

    /**
     * Convert the VectorStore setting to a DTO
     * @param entity the [VectorStoreSetting] as recorded in the database
     * @return [VectorStoreSettingDTO]
     */
    fun toDTO(entity: VectorStoreSetting): VectorStoreSettingDTO =
        with(entity){
            when(this){
                is OpenSearchVectorStoreSetting -> {
                    val fetchedPassword = SecurityUtils.fetchSecretKeyValue(password)
                    return OpenSearchVectorStoreSetting(k, vectorSize, host, port, username, fetchedPassword)
                }
                is PGVectorStoreSetting -> {
                    val fetchedPassword = SecurityUtils.fetchSecretKeyValue(password)
                    return PGVectorStoreSetting(k, vectorSize, host, port, username, fetchedPassword, database)
                }
                else ->
                    throw IllegalArgumentException("Unsupported VectorStore Setting")
            }
        }

    /**
     * Convert the VectorStore setting DTO to an Entity
     * @param dto the [VectorStoreSettingDTO]
     * @param secretName the secret name
     * @return [VectorStoreSetting]
     */
    fun toEntity(dto: VectorStoreSettingDTO, secretName: String): VectorStoreSetting =
        with(dto){
            when(this){
                is OpenSearchVectorStoreSetting -> {
                    val secretPassword = SecurityUtils.getSecretKey(password, secretName)
                    return OpenSearchVectorStoreSetting(k, vectorSize, host, port, username, secretPassword)
                }
                is PGVectorStoreSetting -> {
                    val secretPassword = SecurityUtils.getSecretKey(password, secretName)
                    return PGVectorStoreSetting(k, vectorSize, host, port, username, secretPassword, database)
                }
                else ->
                    throw IllegalArgumentException("Unsupported VectorStore Setting")
            }
        }

}