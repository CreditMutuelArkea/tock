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

package ai.tock.bot.admin.model.indicator

import ai.tock.bot.admin.model.ToValidate


abstract  class BaseIndicatorRequest(
    open val label: String,
    open val description: String?= null,
    open val dimensions: Set<String> = mutableSetOf(),
    open val values: Set<IndicatorValueRequest>
) : ToValidate {
    override fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (label.isBlank()) errors.add("Indicator's label is required")
        if (values.isEmpty()) errors.add("Indicator must have at least one value")
        errors.addAll(values.map { it.validate() }.reduce {l1 , l2 -> l1 + l2} )
        if (dimensions.isEmpty()) errors.add("Indicator must have at least one dimension")
        if (dimensions.any { it.isEmpty() }) errors.add("Dimension cannot be empty")
        return errors
    }

}

data class SaveIndicatorRequest(
    val name: String,
    override val label: String,
    override val description: String?= null,
    override val dimensions: Set<String> = mutableSetOf(),
    override val values: Set<IndicatorValueRequest>
) : BaseIndicatorRequest(label, description, dimensions, values) {
    override fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (name.isBlank()) errors.add("Indicator's ame is required")
        if (label.isBlank()) errors.add("Indicator's label is required")

        return (super.validate() + errors)
    }

}

data class IndicatorValueRequest(val name: String, val label: String) : ToValidate {
    override fun validate(): List<String> {
        val errors = mutableListOf<String>()
        if (name.isBlank()) errors.add("Indicator's value name is required")
        if (label.isBlank()) errors.add("Indicator's value label is required")
        return errors
    }
}

data class UpdateIndicatorRequest(
    override val label: String,
    override val description: String?= null,
    override val dimensions: Set<String> = mutableSetOf(),
    override val values: Set<IndicatorValueRequest>
): BaseIndicatorRequest(label, description, dimensions, values)


