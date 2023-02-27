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

package ai.tock.bot.admin.indicators

import org.litote.kmongo.Id
import org.litote.kmongo.newId

data class Indicator(
    val _id: Id<Indicator> = newId(),
    val name: String,
    val label: String,
    val description: String?= null,
    // The application name
    val botId: String,
    val dimensions: Set<String> = mutableSetOf(),
    val values: Set<IndicatorValue>
)