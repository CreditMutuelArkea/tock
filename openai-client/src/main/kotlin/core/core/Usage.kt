package core.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
class Usage(
    /**
     * Count of prompts tokens.
     */
    @SerialName("prompt_tokens") val promptTokens: Int? = null,
    /**
     * Count of completion tokens.
     */
    @SerialName("completion_tokens") val completionTokens: Int? = null,
    /**
     * Count of total tokens.
     */
    @SerialName("total_tokens") val totalTokens: Int? = null,
)
