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

package ai.tock.bot.admin.indicators.metric

import ai.tock.bot.engine.dialog.Dialog
import ai.tock.bot.engine.user.PlayerId
import org.litote.kmongo.Id
import org.litote.kmongo.newId
import java.time.Instant

/**
 * Metric data class
 * @param _id optional because autogenerated
 * @param type mandatory type
 * @param indicatorName mandatory indicator name
 * @param indicatorValueName mandatory indicator value name
 * @param emitterStoryId mandatory id of emitter story,
 * @param trackedStoryId mandatory id of tracked story
 * @param playerIds mandatory player ids - set of [PlayerId]
 * @param dialogId mandatory dialog id
 * @param creationDate the creation date
 * @param botId the application name
 */
data class Metric(
    val _id: Id<Metric> = newId(),
    val type: TypeMetric,
    val indicatorName: String?,
    val indicatorValueName: String?,
    val emitterStoryId: String,
    val trackedStoryId: String,
    val playerIds: Set<PlayerId>,
    val dialogId: Id<Dialog>,
    val creationDate: Instant = Instant.now(),
    val botId: String
)

