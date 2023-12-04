#   Copyright (C) 2023 Credit Mutuel Arkea
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
from enum import Enum, unique
from typing import Optional

from pydantic import BaseModel, Field

from llm_orchestrator.models.llm.llm_provider import LLMProvider


@unique
class ErrorCode(Enum):
    PROVIDER_NOT_FOUND = 1000
    PROVIDER_BAD_QUERY = 1001

    PROVIDER_API_ERROR = 2000
    PROVIDER_API_CONNECTION_ERROR = 2001
    PROVIDER_API_AUTHENTICATION_ERROR = 2002

    PROVIDER_API_RESOURCE_NOT_FOUND = 2003
    PROVIDER_API_MODEL_NOT_FOUND = 2004
    PROVIDER_API_DEPLOYMENT_NOT_FOUND = 2005

    PROVIDER_API_BAD_REQUEST = 2006
    PROVIDER_API_CONTEXT_LENGTH_EXCEEDED_BAD_REQUEST = 2007


class ErrorMessage(BaseModel):
    message: str = Field(
        description='The AI orchestrator error message',
        examples=['Authentication error to the AI provider API.'],
    )
    detail: Optional[str] = Field(
        description='The AI orchestrator error detail. It provides help or a solution',
        examples=[
            'Check your API key or token and make sure it is correct and active.'
        ],
        default=None,
    )


class ErrorInfo(BaseModel):
    provider: str = Field(
        description='The AI provider ID', examples=[LLMProvider.AZURE_OPEN_AI_SERVICE]
    )
    error: str = Field(description='The error', examples=['BadRequestError'])
    cause: str = Field(
        description='The error cause', examples=['Invalid value for query parameter']
    )
    request: str = Field(
        description='The AI provider API or the AI Orchestrator API',
        examples=['[POST] https://api.openai.com/v1/chat/completions'],
    )
