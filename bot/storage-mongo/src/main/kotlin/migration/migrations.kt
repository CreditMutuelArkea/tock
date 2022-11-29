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

import org.litote.kmongo.Id
import org.litote.kmongo.json
import org.litote.kmongo.newId
import java.time.LocalDateTime
import java.util.function.Supplier
import java.util.zip.CRC32

/**
 * MigrationFn represents the suspend function
 */
typealias MigrateFn = () -> Unit

/**
 * MigrationHandler represents a function to execute
 * in order to make a DB migration associated to the migration's version
 * @param name the migration version that must be unique
 * @param description the migration description
 * @param collectionName the collection effected by the migration
 * @param migrateFn the function that execute the migration
 */
data class MigrationHandler(
    val name: String,
    val description: String,
    val collectionName: String,
    val migrateFn: MigrateFn
    ){

    /**
     * Convert a migrationHandler into a [Migration]
     */
    fun toMigration(): Migration = with(this) {
        Migration(
            name = name,
            description = description,
            collectionName = collectionName,
            checksum = checksum()
        )
    }

    private fun checksum(): Long {
        val crC32 = CRC32()
        crC32.update(this.migrateFn.json.toByteArray())
        return crC32.value
    }

    infix fun isLike(migration: Migration): Boolean = name == migration.name && collectionName == migration.collectionName

    infix fun isSame(migration: Migration): Boolean = migration.checksum == checksum()

}

/**
 * Migration represents a DB document/entity representing a DB migration
 * @param _id the DB document identifier
 * @param name the migration name
 * @param description the migration description
 * @param collectionName the collection effected by the migration
 * @param executedAt date of the migration's execution
 *
 */
data class Migration(
    val _id: Id<Migration> = newId(),
    val name: String,
    val description: String,
    val collectionName: String,
    val checksum: Long,
    val executedAt: LocalDateTime = LocalDateTime.now()
)

/**
 * MigrationHandlers provider
 */
interface MigrationsProvider : Supplier<Set<MigrationHandler>>

class MigrationException(message: String): Exception(message)