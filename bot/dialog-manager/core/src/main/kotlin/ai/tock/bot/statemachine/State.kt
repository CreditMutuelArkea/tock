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

package ai.tock.bot.statemachine

/**
 * The main component of the state machine.
 * Recursive element
 */
@kotlinx.serialization.Serializable
data class State(
    val id: String,
    val type: String? = null,
    val initial: String? = null,
    val states: Map<String, State>? = null,
    val on: Map<String, String>? = null)