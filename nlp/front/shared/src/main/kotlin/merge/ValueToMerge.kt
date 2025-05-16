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

package ai.tock.nlp.front.shared.merge

import ai.tock.nlp.core.merge.ValueDescriptor
import ai.tock.nlp.entity.Value

/**
 *
 */
data class ValueToMerge(
    val value: Value,
    val content: String? = null,
    val initial: Boolean = false,
    val position: Int? = null,
    val probability: Double = 1.0
) {

    fun toValueDescriptor(): ValueDescriptor {
        return ValueDescriptor(value, content, initial, position, probability)
    }
}
