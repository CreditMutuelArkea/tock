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

package ai.tock.bot.mongo

import org.bson.Document
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Unit tests for MongoAggregationDSL.
 */
internal class MongoAggregationDSLTest {

    /**
     * Helper function to extract Document from Bson.
     * All DSL functions return Document instances wrapped as Bson, so direct cast is safe.
     */
    private fun org.bson.conversions.Bson.toDocument(): Document = when (this) {
        is Document -> this
        else -> throw IllegalArgumentException("Expected Document but got ${this::class.simpleName}")
    }

    @Test
    fun `filterByOldestDateInPeriod returns null when both dates are null`() {
        val result = Agg.filterByOldestDateInPeriod(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = null,
            toDate = null
        )
        assertNull(result, "Should return null when both dates are null")
    }

    @Test
    fun `filterByOldestDateInPeriod returns expression with $expr and $gte when only fromDate is set`() {
        val fromDate = ZonedDateTime.parse("2025-12-10T10:00:00Z")
        val result = Agg.filterByOldestDateInPeriod(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = fromDate,
            toDate = null
        )
        assertNotNull(result, "Should return expression when fromDate is set")
        val doc = result.toDocument()
        assertTrue(
            doc.containsKey("\$expr"),
            "Filter should contain \$expr. Filter: ${doc.toJson()}"
        )
        val expr = doc.get("\$expr")
        assertTrue(
            expr is Document && expr.containsKey("\$gte"),
            "Filter \$expr should contain \$gte for fromDate condition. Expr: ${(expr as? Document)?.toJson()}"
        )
    }

    @Test
    fun `filterByOldestDateInPeriod returns expression with $expr and $lte when only toDate is set`() {
        val toDate = ZonedDateTime.parse("2025-12-10T10:00:00Z")
        val result = Agg.filterByOldestDateInPeriod(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = null,
            toDate = toDate
        )
        assertNotNull(result, "Should return expression when toDate is set")
        val doc = result.toDocument()
        assertTrue(
            doc.containsKey("\$expr"),
            "Filter should contain \$expr. Filter: ${doc.toJson()}"
        )
        val expr = doc.get("\$expr")
        assertTrue(
            expr is Document && expr.containsKey("\$lte"),
            "Filter \$expr should contain \$lte for toDate condition. Expr: ${(expr as? Document)?.toJson()}"
        )
    }

    @Test
    fun `filterByOldestDateInPeriod returns expression with $expr and $and when both dates are set`() {
        val fromDate = ZonedDateTime.parse("2025-12-10T10:00:00Z")
        val toDate = ZonedDateTime.parse("2025-12-20T10:00:00Z")
        val result = Agg.filterByOldestDateInPeriod(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = fromDate,
            toDate = toDate
        )
        assertNotNull(result, "Should return expression when both dates are set")
        val doc = result.toDocument()
        assertTrue(
            doc.containsKey("\$expr"),
            "Filter should contain \$expr. Filter: ${doc.toJson()}"
        )
        val expr = doc.get("\$expr")
        assertTrue(
            expr is Document && expr.containsKey("\$and"),
            "Filter \$expr should contain \$and for multiple conditions. Expr: ${(expr as? Document)?.toJson()}"
        )
        val andConditions = (expr as Document).getList("\$and", Document::class.java)
        assertTrue(
            andConditions.size == 2,
            "Filter should contain 2 conditions in \$and. Conditions: ${andConditions.map { it.toJson() }}"
        )
        assertTrue(
            andConditions.any { it.containsKey("\$gte") },
            "One condition should contain \$gte for fromDate"
        )
        assertTrue(
            andConditions.any { it.containsKey("\$lte") },
            "One condition should contain \$lte for toDate"
        )
    }

    @Test
    fun `filterByPeriodOverlap returns null when both dates are null`() {
        val result = Agg.filterByPeriodOverlap(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = null,
            toDate = null
        )
        assertNull(result, "Should return null when both dates are null")
    }

    @Test
    fun `filterByPeriodOverlap returns expression with $expr and $gte when only fromDate is set`() {
        val fromDate = ZonedDateTime.parse("2025-12-10T10:00:00Z")
        val result = Agg.filterByPeriodOverlap(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = fromDate,
            toDate = null
        )
        assertNotNull(result, "Should return expression when fromDate is set")
        val doc = result.toDocument()
        assertTrue(
            doc.containsKey("\$expr"),
            "Filter should contain \$expr. Filter: ${doc.toJson()}"
        )
        val expr = doc.get("\$expr")
        assertTrue(
            expr is Document && expr.containsKey("\$gte"),
            "Filter \$expr should contain \$gte for fromDate <= youngestDate condition. Expr: ${(expr as? Document)?.toJson()}"
        )
    }

    @Test
    fun `filterByPeriodOverlap returns expression with $expr and $lt when only toDate is set`() {
        val toDate = ZonedDateTime.parse("2025-12-10T10:00:00Z")
        val result = Agg.filterByPeriodOverlap(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = null,
            toDate = toDate
        )
        assertNotNull(result, "Should return expression when toDate is set")
        val doc = result.toDocument()
        assertTrue(
            doc.containsKey("\$expr"),
            "Filter should contain \$expr. Filter: ${doc.toJson()}"
        )
        val expr = doc.get("\$expr")
        assertTrue(
            expr is Document && expr.containsKey("\$lt"),
            "Filter \$expr should contain \$lt for oldestDate < toDate condition. Expr: ${(expr as? Document)?.toJson()}"
        )
    }

    @Test
    fun `filterByPeriodOverlap returns expression with $expr and $and when both dates are set`() {
        val fromDate = ZonedDateTime.parse("2025-12-10T10:00:00Z")
        val toDate = ZonedDateTime.parse("2025-12-20T10:00:00Z")
        val result = Agg.filterByPeriodOverlap(
            inputField = "stories",
            datePath = "actions.date",
            fromDate = fromDate,
            toDate = toDate
        )
        assertNotNull(result, "Should return expression when both dates are set")
        val doc = result.toDocument()
        assertTrue(
            doc.containsKey("\$expr"),
            "Filter should contain \$expr. Filter: ${doc.toJson()}"
        )
        val expr = doc.get("\$expr")
        assertTrue(
            expr is Document && expr.containsKey("\$and"),
            "Filter \$expr should contain \$and for multiple conditions. Expr: ${(expr as? Document)?.toJson()}"
        )
        val andConditions = (expr as Document).getList("\$and", Document::class.java)
        assertTrue(
            andConditions.size == 2,
            "Filter should contain 2 conditions in \$and. Conditions: ${andConditions.map { it.toJson() }}"
        )
        assertTrue(
            andConditions.any { it.containsKey("\$gte") },
            "One condition should contain \$gte for fromDate <= youngestDate"
        )
        assertTrue(
            andConditions.any { it.containsKey("\$lt") },
            "One condition should contain \$lt for oldestDate < toDate"
        )
    }
}

