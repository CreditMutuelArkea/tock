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

package migration

import ai.tock.bot.mongo.MongoBotConfiguration
import ai.tock.shared.ensureUniqueIndex
import com.mongodb.client.MongoCollection
import org.litote.kmongo.and
import org.litote.kmongo.eq
import org.litote.kmongo.save
import org.litote.kmongo.getCollection

/**
 * Mongo implementation of [MigrationDAO]
 */
object MigrationMongoDAO: MigrationDAO {

    /**
     * Migration collection
     */
    private val collection: MongoCollection<Migration> by lazy {
        MongoBotConfiguration.database.getCollection<Migration>().apply {
            ensureUniqueIndex(Migration::name, Migration::collectionName)
        }
    }

    /**
     * @see MigrationDAO.existsByNameAndCollectionName
     */
    override fun existsByNameAndCollectionName(name: String, collectionName: String): Boolean =
        collection.countDocuments(and(
            Migration::name eq  name,
            Migration::collectionName eq collectionName)) > 0

    /**
     * @see MigrationDAO.save
     */
    override fun save(migration: Migration) = collection.save(migration)
}