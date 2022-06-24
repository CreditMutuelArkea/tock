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

package ai.tock.bot.processor

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class StackTest {

    @Test fun global(){
        val s = Stack<Int>()

        assertTrue { s.isEmpty() }

        s.push(10)
        assertEquals(10, s.peek())

        s.push(20)
        assertEquals(20, s.peek())

        s.push(30)
        assertEquals(30, s.peek())

        assertFalse { s.isEmpty() }
        assertTrue { s.contains(10) }
        assertTrue { s.contains(20) }
        assertTrue { s.contains(30) }

        val valuePoped = s.pop()
        assertEquals(30, valuePoped)
        assertFalse { s.contains(30) }

        // the new top element
        assertEquals(20, s.peek())

        assertFalse { s.isEmpty() }

        s.clear()
        assertTrue { s.isEmpty() }
        assertFalse { s.contains(10) }
        assertFalse { s.contains(20) }
    }

}