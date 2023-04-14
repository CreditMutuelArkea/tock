/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

package ai.tock.bot.admin.verticle

import ai.tock.shared.exception.ToRestException
import ai.tock.shared.vertx.WebVerticle
import ch.tutteli.atrium.core.polyfills.fullName

interface ChildVerticle<T : ToRestException> {
    fun configure(parent: WebVerticle<T>)
}

interface ParentVerticle<T : ToRestException> {

    fun children(): List<ChildVerticle<T>>

    fun preConfigure() {
        if (this !is WebVerticle<*>)
            throw IllegalStateException("ParentVerticle ${this::class.fullName} must be a WebVerticle")

        var verticles = "\n"

        children().forEach {
            verticles +=  "    🚀  ${it.javaClass.simpleName}\n"
            @Suppress("UNCHECKED_CAST")
            it.configure(this as WebVerticle<T>)
        }

        this.logger.info("\nList of configured verticles : $verticles")
    }
}