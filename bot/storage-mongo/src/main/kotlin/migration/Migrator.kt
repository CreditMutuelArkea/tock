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

import ai.tock.shared.injector
import com.github.salomonbrys.kodein.instance

/**
 * Migrator is responsible to perform migrations declared in migrationProvider
 */
object Migrator {

    /**
     * Constants
     */
    internal const val SEPARATOR = "//"
    internal const val BACK_TO_LINE = "\n"
    internal const val PREFIX = "  * "
    internal const val DUPLICATE_MIGRATIONS_MESSAGE = "Duplicate names found for migrations :$BACK_TO_LINE"
    internal const val PERSISTED_MIGRATIONS_CHANGES_MESSAGE = "Following persisted migrations have changed :\n"

    /**
     * Injected dependencies
     */
    private val migrationDao: MigrationDAO by injector.instance()
    private val migrationProvider: MigrationsProvider by injector.instance()

    /**
     * Execute migrations provided by migrationProvider and
     * that are not already persisted in database
     */
    fun migrate() = with(migrationDao) {
        migrationProvider
            .validate(migrationDao.findAll())
            .filterNot { existsByNameAndCollectionName(it.name, it.collectionName) }
            .forEach {
                it.migrateFn.invoke()
                save(it.toMigration())
            }
    }
}

/**
 * String extension function that execute the function
 * passed in parameter if the string is not blank
 */
fun String.ifNotBlank(fn: (String) -> Unit) {
    if (this.isNotBlank()) fn.invoke(this)
}

/**
 * Validate a migration handlers and return them if valid
 * @param migrations persisted migrations
 * @return list of migration handlers
 */
fun MigrationsProvider.validate(migrations: List<Migration>): Set<MigrationHandler> = get().also { handlers ->
    migrations
        .filter { migration ->
            handlers
                .filter { migrationHandler -> migrationHandler isLike migration }
                .none { migrationHandler -> migrationHandler isSame migration }
        }
        .map { m -> " - { name: ${m.name} , collectionName: ${m.collectionName} }" }
        .joinToString { Migrator.BACK_TO_LINE }
        .ifNotBlank { s -> error("${Migrator.PERSISTED_MIGRATIONS_CHANGES_MESSAGE} $s") }

    handlers.groupBy { m -> Migrator.PREFIX + m.name + Migrator.SEPARATOR + m.collectionName }
        .filter { entry -> entry.value.size > 1 }
        .keys
        .joinToString(Migrator.BACK_TO_LINE)
        .ifNotBlank { key -> error(" ${Migrator.DUPLICATE_MIGRATIONS_MESSAGE} ${key.split(Migrator.SEPARATOR)[0]}") }
}
