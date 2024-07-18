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
"""Module for Response Models"""
from enum import Enum, unique
from typing import Any, Optional, Dict

from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic_core import core_schema

from gen_ai_orchestrator.models.em.em_provider import EMProvider
from gen_ai_orchestrator.models.errors.errors_models import ErrorCode, ErrorInfo
from gen_ai_orchestrator.models.llm.llm_provider import LLMProvider
from gen_ai_orchestrator.models.observability.observability_provider import ObservabilityProvider
from gen_ai_orchestrator.models.rag.rag_models import TextWithFootnotes
from gen_ai_orchestrator.models.vector_stores.vectore_store_provider import VectorStoreProvider


class ErrorResponse(BaseModel):
    """The error response model"""

    code: ErrorCode = Field(
        description='The AI orchestrator error code.',
        examples=[ErrorCode.GEN_AI_AUTHENTICATION_ERROR],
    )
    message: str = Field(
        description='The AI orchestrator error message.',
        examples=['Authentication error to the AI Provider API.'],
    )
    detail: Optional[str] = Field(
        description='The AI orchestrator error detail. It provides help or a solution.',
        examples=[
            'Check your API key or token and make sure it is correct and active.'
        ],
        default=None,
    )
    info: ErrorInfo = Field(
        description='The AI orchestrator error info. It exposes the raised error cause.'
    )


@unique
class MetadataCode(Enum):
    """Enumeration to list metadata response codes"""

    VECTOR_STORE_DOCUMENT_COUNT = 'VECTOR_STORE_DOCUMENT_COUNT'

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.JsonSchema, handler: GetJsonSchemaHandler
    ) -> Dict:
        """
        Document error codes using the names in the enum so that they are more comprehensible in the openAPI spec.
        """
        return {
            'enum': [item.value for item in cls],
            'description': '\n'.join(
                [f'* `{item.value}`: {item.name}' for item in cls]
            ),
            'type': 'string',
        }


class MetadataResponse(BaseModel):
    """The metadata response model"""

    code: MetadataCode = Field(
        description='The metadata code.',
        examples=[MetadataCode.VECTOR_STORE_DOCUMENT_COUNT],
    )
    value: Any = Field(
        description='The metadata value.',
        examples=['myValue'],
    )


class ProviderSettingStatus(BaseModel):
    """The response model of the provider setting status"""

    valid: bool = Field(
        description='It indicates the setting validity.',
        examples=[True],
        default=False,
    )
    metadata: list[MetadataResponse] = Field(description='Status infos.', default=[])


class ProviderSettingStatusResponse(ProviderSettingStatus):
    """The response model of the provider setting status"""

    errors: list[ErrorResponse] = Field(description='The list of errors.', default=[])


class LLMProviderResponse(BaseModel):
    """The response model of the LLM provider"""

    provider: LLMProvider = Field(
        description='The LLM Provider ID', default=[LLMProvider.OPEN_AI]
    )


class VectorStoreProviderResponse(BaseModel):
    """The response model of the Vector Store provider"""

    provider: VectorStoreProvider = Field(
        description='The Vector Store Provider ID', default=[VectorStoreProvider.OPEN_SEARCH]
    )


class ObservabilityProviderResponse(BaseModel):
    """The response model of the Observability provider"""

    provider: ObservabilityProvider = Field(
        description='The Observability Provider ID', default=[ObservabilityProvider.LANGFUSE]
    )


class EMProviderResponse(BaseModel):
    """The response model of the EM provider"""

    provider: EMProvider = Field(
        description='The Embedding Model Provider ID',
        default=[EMProvider.AZURE_OPEN_AI_SERVICE],
    )


class RagResponse(BaseModel):
    """The RAG response model"""

    answer: TextWithFootnotes = Field(
        description='The RAG answer, with outside sources.'
    )
    debug: Optional[Any] = Field(
        description='Debug data',
        examples=[{'action': 'retrieve', 'result': 'OK', 'errors': []}],
        default=None,
    )


class SentenceGenerationResponse(BaseModel):
    """The sentence generation response model"""

    sentences: list[str] = Field(
        description='The list of generated sentences.',
        default=[]
    )
