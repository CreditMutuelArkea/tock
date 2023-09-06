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
import ai.tock.bot.admin.bot.BotRAGConfiguration
import ai.tock.bot.admin.bot.BotRAGConfigurationDAO
import ai.tock.bot.mongo.MongoBotConfiguration.asyncDatabase
import ai.tock.bot.mongo.MongoBotConfiguration.database
import ai.tock.shared.ensureUniqueIndex
import ai.tock.shared.watch
import org.litote.kmongo.Id
import org.litote.kmongo.deleteOneById
import org.litote.kmongo.eq
import org.litote.kmongo.findOne
import org.litote.kmongo.getCollection
import org.litote.kmongo.reactivestreams.getCollection
import org.litote.kmongo.reactivestreams.getCollectionOfName
import org.litote.kmongo.save

internal object BotRAGConfigurationMongoDAO : BotRAGConfigurationDAO {

    private const val COLLECTION_NAME = "bot_rag_configuration"
    internal val col = database.getCollection<BotRAGConfiguration>(COLLECTION_NAME)
    private val asyncCol = asyncDatabase.getCollection<BotRAGConfiguration>()

    init {
        col.ensureUniqueIndex(Namespace, BotId)
    }

    override fun listenChanges(listener: () -> Unit) {
        asyncCol.watch { listener() }
    }

    override fun findByNamespaceAndBotId(
        namespace: String,
        botId: String
    ): BotRAGConfiguration? {
        return col.findOne(Namespace eq namespace, BotId eq botId)
    }

    override fun save(conf: BotRAGConfiguration): BotRAGConfiguration {
        col.save(conf)
        return conf
    }

    override fun delete(id: Id<BotRAGConfiguration>) {
        col.deleteOneById(id)
    }

}
