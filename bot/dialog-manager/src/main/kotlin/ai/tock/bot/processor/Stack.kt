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

/**
 * A stack of element. Used to store objectives
 */
class Stack<T> {
    private val stack = mutableListOf<T>()

    constructor()

    constructor(elements: List<T>) {
        elements.forEach(::push)
    }

    fun isEmpty(): Boolean = stack.isEmpty()

    fun push(element: T)  = stack.add(element)

    fun pop(): T? =
        if(stack.isNotEmpty()){
            stack.removeLast()
        }else{
            null
        }

    fun peek(): T? =
        if(stack.isEmpty()){
            null
        }else{
            stack.last()
        }

    fun contains(element: T): Boolean = stack.contains(element)

    fun clear() = stack.clear()

    fun toList(): List<T> = stack.toList()

    override
    fun toString(): String = stack.joinToString(" | ")
}
