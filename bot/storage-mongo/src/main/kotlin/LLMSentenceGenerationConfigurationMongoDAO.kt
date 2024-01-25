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

package ai.tock.bot.mongo

import ai.tock.bot.admin.bot.BotApplicationConfiguration_.Companion.BotId
import ai.tock.bot.admin.bot.BotApplicationConfiguration_.Companion.Namespace
import ai.tock.bot.admin.bot.llmSentenceGeneration.LLMSentenceGenerationConfigurationDAO
import ai.tock.bot.admin.bot.llmSentenceGeneration.LLMSentenceGenerationConfiguration
import ai.tock.bot.mongo.MongoBotConfiguration.asyncDatabase
import ai.tock.bot.mongo.MongoBotConfiguration.database
import ai.tock.shared.ensureUniqueIndex
import ai.tock.shared.watch
import org.litote.kmongo.*
import org.litote.kmongo.reactivestreams.getCollection

internal object LLMSentenceGenerationConfigurationMongoDAO : LLMSentenceGenerationConfigurationDAO {

    private const val COLLECTION_NAME = "llm_sentence_generation_configuration"
    internal val col = database.getCollection<LLMSentenceGenerationConfiguration>(COLLECTION_NAME)
    private val asyncCol = asyncDatabase.getCollection<LLMSentenceGenerationConfiguration>()

    init {
        col.ensureUniqueIndex(Namespace, BotId)
    }

    override fun listenChanges(listener: () -> Unit) {
        asyncCol.watch { listener() }
    }

    override fun findByNamespaceAndBotId(
        namespace: String,
        botId: String
    ): LLMSentenceGenerationConfiguration? {
        return col.findOne(Namespace eq namespace, BotId eq botId)
    }

    override fun save(conf: LLMSentenceGenerationConfiguration): LLMSentenceGenerationConfiguration {
        col.save(conf)
        return conf
    }

    override fun delete(id: Id<LLMSentenceGenerationConfiguration>) {
        col.deleteOneById(id)
    }

}
