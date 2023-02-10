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

package ai.tock.bot

enum class HandlerNamespace(val key: String, val shared: Boolean = true) { // TODO MASS : false as default
    DEV_TOOLS(key = "dev-tools", shared = true),
    MAX(key = "max"),
    SURAVENIR_ASSURANCES(key = "suravenir-assurances"),
    AVENIR_ASSURANCE(key = "avenir-assurance"), // TODO MASS : to delete
    JOIGNABILITE(key = "joignabilite"),
    UNKNOWN(key = "UNKNOWN");

    companion object {
        fun find(namespace: String): HandlerNamespace =
            HandlerNamespace.values().firstOrNull{ it.key == namespace } ?: UNKNOWN
    }
}