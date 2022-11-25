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

/**
 * Data Access Object for database migration entities/documents
 */
interface MigrationDAO {
    /**
     * check if a migration exists by a given name and collectionName
     * @param name the name of migration
     * @param collectionName the name of the collection affected by the migration
     * @return true if a migration
     */
    fun existsByNameAndCollectionName(name: String, collectionName: String): Boolean

    /**
     * Persist a migration
     * @param migration the migration to persist
     */
    fun save(migration: Migration)
}