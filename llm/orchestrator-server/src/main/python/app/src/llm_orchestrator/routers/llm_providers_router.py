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
import logging

from fastapi import APIRouter, HTTPException

from llm_orchestrator.exceptions.business_exception import (
    BusinessException,
    InvalidQueryException,
    UnknownProviderException,
)
from llm_orchestrator.exceptions.error_code import ErrorCode
from llm_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.models.llm.llm_types import LLMSetting
from llm_orchestrator.models.llm.openai.openai_llm_setting import (
    OpenAILLMSetting,
)
from llm_orchestrator.routers.requests.requests import (
    ErrorResponse,
    LLMProviderSettingStatusQuery,
    LLMProviderSettingStatusResponse,
)
from llm_orchestrator.routers.responses.responses import LLMProviderResponse
from llm_orchestrator.services.llm.llm_service import check_llm_setting

logger = logging.getLogger(__name__)

llm_providers_router = APIRouter(
    prefix='/llm-providers',
    tags=['Large Language Model Providers'],
    responses={404: {'description': 'Not found'}},
)


@llm_providers_router.get('')
async def get_all_llm_providers() -> list[LLMProvider]:
    return [provider.value for provider in LLMProvider]


@llm_providers_router.get('/{provider_id}')
async def get_llm_provider_by_id(provider_id: str) -> LLMProviderResponse:
    if LLMProvider.has_value(provider_id):
        return LLMProviderResponse(provider=LLMProvider(provider_id))
    else:
        raise HTTPException(status_code=400, detail=ErrorCode.E20)


@llm_providers_router.get('/{provider_id}/setting/example')
async def get_llm_provider_setting_by_id(provider_id: LLMProvider) -> LLMSetting:
    if provider_id == LLMProvider.OPEN_AI:
        return OpenAILLMSetting(
            provider=LLMProvider.OPEN_AI,
            api_key='123-abc-456-def',
            model='gpt-3.5-turbo',
            temperature=1.3,
            prompt='How to learn to ride a bike without wheels!',
        )
    elif provider_id == LLMProvider.AZURE_OPEN_AI_SERVICE:
        return AzureOpenAILLMSetting(
            provider=LLMProvider.AZURE_OPEN_AI_SERVICE,
            api_key='123-abc-456-def',
            model='gpt-3.5-turbo',
            deployment_name='my-deployment-name',
            api_base='https://doc.tock.ai/tock',
            api_version='2023-05-15',
            temperature=0.7,
            prompt='How to learn to ride a bike without wheels!',
        )
    else:
        raise HTTPException(status_code=400, detail=ErrorCode.E20)


@llm_providers_router.post('/{provider_id}/setting/status')
async def check_llm_provider_setting(
    provider_id: str, query: LLMProviderSettingStatusQuery
) -> LLMProviderSettingStatusResponse:
    # Query validation
    validate_query(provider_id, query.setting)

    try:
        # LLM setting check
        check_llm_setting(query.setting)

        return LLMProviderSettingStatusResponse(valid=True)
    except BusinessException as e:
        logger.error(e)
        return LLMProviderSettingStatusResponse(
            errors=[
                ErrorResponse(
                    code=e.error_code, message=e.message, parameters=e.parameters
                )
            ]
        )


def validate_query(provider_id, setting):
    if not LLMProvider.has_value(provider_id):
        raise UnknownProviderException({'provider': provider_id})
    elif provider_id != setting.provider:
        raise InvalidQueryException(
            {'provider': provider_id, 'setting': setting.provider}
        )
