package client




import OpenAIConfig
import core.http.Timeout
import core.logging.LogLevel
import internal.OpenAIApi
import internal.createHttpClient
import internal.http.HttpTransport
import kotlin.time.Duration.Companion.minutes

internal val token: String
    get() = requireNotNull(System.getProperty("OPENAI_API_KEY") ?: System.getenv("OPENAI_API_KEY")) {
        "OPENAI_API_KEY environment variable must be set."
    }

internal val transport = HttpTransport(
    createHttpClient(
        OpenAIConfig(
            token = token,
            logLevel = LogLevel.All,
            timeout = Timeout(socket = 1.minutes),
        )
    )
)

abstract class TestOpenAI {
    internal val openAI = OpenAIApi(transport)
}
