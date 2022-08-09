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

package ai.tock.bot.admin.scenario

import ai.tock.bot.admin.scenario.ScenarioState.*
import ai.tock.shared.exception.*

/**
 * Throws RestException if scenario cannot be created in database
 */
val checkToCreate: Scenario.() -> Scenario = {
    if(id != null && id!!.isNotBlank()) {
        throw ScenarioWithIdException(id!!, "scenario id is $id")
    } else if(!DRAFT.equals(state)) {
        throw BadScenarioStateException(DRAFT.name, state.name, "scenario state must be ${DRAFT.name}, but is ${state.name}")
    } else {
        this
    }
}

/**
 * Throws RestException if scenario cannot be created in database
 */
val checkToUpdate: Scenario.(Scenario?) -> Scenario = { scenarioDataBase ->
    if(scenarioDataBase == null) {
        throw ScenarioNotFoundException(id, "$id not found")
    } else if(scenarioDataBase.id != id) {
        throw BadScenarioIdException(scenarioDataBase.id, id, "scenario id ${scenarioDataBase.id} expected, but was $id")
    } else if(ARCHIVE.equals(scenarioDataBase.state)) {
        throw ScenarioArchivedException(id, "scenario $id state ARCHIVE cannot be updated")
    } else {
        this
    }
}

/**
 * Check if the Scenario is not null, and return it
 * else throws RestException scenario not found
 */
val checkIsNotNullForId: Scenario?.(String?) -> Scenario = { id ->
    if(this == null) {
        throw ScenarioNotFoundException(id, "scenario not found")
    } else {
        this
    }
}

/*
 * Throws RestException if id is null
 */
val checkScenarioFromDatabase: Scenario.() -> Scenario = {
    if (id == null) {
        throw ScenarioWithNoIdException("scenario from database cannot have id null")
    } else {
        this
    }
}