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

package ai.tock.shared.cache

import org.litote.kmongo.Id

/**
 *
 */
internal interface TockCache {

    fun <T> get(id: Id<T>, type: String): T?

    fun <T : Any> put(id: Id<T>, type: String, data: T)

    fun <T> getAll(type: String): Map<Id<T>, Any>

    fun <T> remove(id: Id<T>, type: String)
}
