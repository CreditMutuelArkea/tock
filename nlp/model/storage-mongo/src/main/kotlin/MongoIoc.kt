/*
 * Copyright (C) 2017/2025 SNCF Connect & Tech
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

package ai.tock.nlp.model.service.storage.mongo

import ai.tock.nlp.model.service.storage.NlpApplicationConfigurationDAO
import ai.tock.nlp.model.service.storage.NlpEngineModelDAO
import ai.tock.shared.TOCK_MODEL_DATABASE
import ai.tock.shared.getAsyncDatabase
import ai.tock.shared.getDatabase
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.provider
import com.mongodb.client.MongoDatabase

const val MONGO_DATABASE: String = TOCK_MODEL_DATABASE

val modelMongoModule = Kodein.Module {
    bind<MongoDatabase>(MONGO_DATABASE) with provider { getDatabase(MONGO_DATABASE) }
    bind<com.mongodb.reactivestreams.client.MongoDatabase>(MONGO_DATABASE) with provider { getAsyncDatabase(MONGO_DATABASE) }
    bind<NlpEngineModelDAO>() with provider { NlpEngineModelMongoDAO }
    bind<NlpApplicationConfigurationDAO>() with provider { NlpApplicationConfigurationMongoDAO }
}
