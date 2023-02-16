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

package core.completion

import core.core.Usage
import core.model.ModelId
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * An object containing a response from the completion api.
 *
 * [documentation](https://beta.openai.com/docs/api-reference/create-completion)
 */
@Serializable
 data class TextCompletion(
    /**
     * A unique id assigned to this completion
     */
    @SerialName("id")  val id: String,

    /**
     * The creation time in epoch milliseconds.
     */
    @SerialName("created")  val created: Long,

    /**
     * The GPT-3 model used
     */
    @SerialName("model")  val model: ModelId,

    /**
     * A list of generated completions
     */
    @SerialName("choices")  val choices: List<Choice>,

    /**
     * Text completion usage data.
     */
    @SerialName("usage")  val usage: Usage? = null,
)
