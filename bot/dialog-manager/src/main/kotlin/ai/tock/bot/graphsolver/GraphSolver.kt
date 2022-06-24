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
package ai.tock.bot.graphsolver

import ai.tock.bot.bean.TickAction
import jep.SharedInterpreter
import java.io.File
import java.util.*

/**
 * Class that handles the call to the Clyngor python library
 */
object GraphSolver {

    fun solve(
        actions: Set<TickAction>,
        contexts: Map<String, String?>,
        objective: TickAction,
        ran_handlers: Set<String?>?
    ): List<String> {

        var results: Any?

        // Preparation of input data (Data conversion)
        val botActions = actions.map {
            PyAction(
                it.name,
                it.inputContextNames.toList(),
                it.outputContextNames.toList())}
        val availableContexts = contexts.keys.map {PyContext(it) }
        val target = PyAction(
            objective.name,
            objective.inputContextNames.toList(),
            objective.outputContextNames.toList())

        SharedInterpreter().use { interp ->
            val pythonResourcePath = this.javaClass.classLoader.getResource("python").path
            interp.set("pythonResourcePath", pythonResourcePath)
            interp.runScript("$pythonResourcePath/graph-solver.py")
            results = interp.invoke(
                "callClyngo",
                botActions,
                target,
                availableContexts,
                ran_handlers
            )
        }

        return results as List<String>
    }
}
