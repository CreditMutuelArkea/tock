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

package indicators.metric

import ai.tock.bot.admin.indicators.metric.Metric
import ai.tock.bot.admin.indicators.metric.MetricDAO
import ai.tock.bot.mongo.MongoBotConfiguration
import org.litote.kmongo.eq
import org.litote.kmongo.getCollectionOfName

object MetricMongoDAO : MetricDAO {

    internal val col = MongoBotConfiguration.database.getCollectionOfName<Metric>("metric")

    override fun save(metric: Metric) {
        col.insertOne(metric)
    }

    override fun saveAll(metrics: List<Metric>) {
        col.insertMany(metrics)
    }

    override fun findAllByBotId(botId: String): List<Metric> = col.find(Metric::botId eq botId).toList()

}