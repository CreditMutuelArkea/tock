#   Copyright (C) 2023-2024 Credit Mutuel Arkea
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
"""Module of the Hugging Face handlers"""

import logging

from huggingface_hub import InferenceTimeoutError
from requests import HTTPError

from gen_ai_orchestrator.errors.exceptions.ai_provider.ai_provider_exceptions import (
    AIProviderAPIBadRequestException,
    AIProviderAPIResourceNotFoundException,
)
from gen_ai_orchestrator.errors.exceptions.exceptions import (
    GenAIAuthenticationException,
)
from gen_ai_orchestrator.models.errors.errors_models import ErrorInfo

logger = logging.getLogger(__name__)


def hugging_face_exception_handler(provider: str):
    """
    Managing HuggingFace exceptions

    Args:
        provider: The AI Provider type
    """

    def decorator(func):
        """A decorator of handler function"""

        def wrapper(*args, **kwargs):
            """Exception handling logic"""

            try:
                return func(*args, **kwargs)
            except InferenceTimeoutError as exc:
                logger.error(exc)
                raise AIProviderAPIBadRequestException(
                    create_error_info_hugging_face(exc, provider)
                )
            except HTTPError as exc:
                if (
                    exc.response.status_code == 400
                    or exc.response.status_code == 407
                    or exc.response.status_code == 511
                ):
                    logger.error(exc)
                    raise GenAIAuthenticationException(
                        create_error_info_hugging_face(exc, provider)
                    )
                elif exc.response.status_code == 404:
                    logger.error(exc)
                    raise AIProviderAPIResourceNotFoundException(
                        create_error_info_hugging_face(exc, provider)
                    )

        return wrapper

    return decorator


def create_error_info_hugging_face(exc: HTTPError, provider: str) -> ErrorInfo:
    """
    Create ErrorInfo for a Hugging Face error

    Args:
        exc: the Hugging Face error
        provider: the AI provider type
    Returns:
        The ErrorInfo with the Hugging Face error parameters
    """
    if isinstance(exc, HTTPError):
        return ErrorInfo(
            provider=provider,
            error=exc.response.status_code,
            cause=exc.__cause__,
            request=f'[{exc.request.method}] {exc.request.url}',
        )
    else:
        return ErrorInfo(
            provider=provider, error=exc.response.status_code, cause=str(exc)
        )
