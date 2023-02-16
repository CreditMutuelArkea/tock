package core.exception

/** OpenAI client exception */
sealed class OpenAIException(
    message: String? = null,
    throwable: Throwable? = null
) : RuntimeException(message, throwable)

/** Runtime Http Client exception */
class OpenAIHttpException(
    message: String? = null,
    throwable: Throwable? = null
) : OpenAIException(message, throwable)

/** Runtime API exception */
class OpenAIAPIException(
    statusCode: Int,
    body: String,
) : OpenAIException(message = "(statusCode=$statusCode, body='$body')")
