package internal

import Completions
import OpenAI
import internal.api.CompletionsApi
import internal.http.HttpRequester

/**
 * Implementation of [OpenAI].
 *
 * @param requester http transport layer
 */
internal class OpenAIApi(
    private val requester: HttpRequester
) : OpenAI,
    Completions by CompletionsApi(requester)
