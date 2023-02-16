package client

import core.completion.TextCompletion
import core.completion.completionRequest
import core.model.ModelId
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class TestCompletions : TestOpenAI() {

    @Test
    fun completions() {
        runTest {
            val request = completionRequest {
                model = ModelId("text-ada-001")
                prompt = "Once upon a time"
                maxTokens = 5
                temperature = 1.0
                topP = 1.0
                n = 1
                stop = listOf("\n")
            }

            // Synchronous call
            val completion = openAI.completion(request)
            assertTrue { completion.choices.isNotEmpty() }

            // Asynchronous call
            val results = mutableListOf<TextCompletion>()
            openAI.completions(request)
                .onEach {
                    results += it
                }
                .launchIn(this)
                .join()

            assertNotEquals(0, results.size)
        }
    }

    @Test
    fun completionsWithParameters() {
        runTest {
            val request = completionRequest {
                model = ModelId("text-davinci-003")
                prompt = "Parameters:\n" +
                        "- include sentences with spelling mistakes\n" +
                        "- include sentences with sms language\n" +
                        "- include sentences with abbreviated language\n" +
                        "Takes into account the previous parameters and generates in french language, 5 sentences derived from the sentences in the following table: [\"Je veux activer ma carte bancaire\",\"J'aimerais activer ma carte bancaire.\"]"
                maxTokens = 2048
                temperature = 1.0
                bestOf = 3
                echo = true
            }

            val completion = openAI.completion(request)
            // completion.choices.forEach{ println(it) }

            assertTrue { completion.choices.isNotEmpty() }
        }
    }

}


