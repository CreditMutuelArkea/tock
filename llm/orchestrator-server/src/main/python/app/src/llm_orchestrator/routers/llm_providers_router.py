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

from fastapi import APIRouter, HTTPException, Request

from llm_orchestrator.errors.error_factories import (
    create_error_info_bad_request,
    create_error_info_not_found,
    create_error_response,
)
from llm_orchestrator.errors.exceptions.exceptions import (
    BusinessException,
    InvalidQueryException,
    UnknownProviderException,
)
from llm_orchestrator.models.errors.errors_models import ErrorCode, ErrorInfo
from llm_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.models.llm.llm_types import LLMSetting
from llm_orchestrator.models.llm.openai.openai_llm_setting import (
    OpenAILLMSetting,
)
from llm_orchestrator.routers.requests.requests import (
    LLMProviderSettingStatusQuery,
)
from llm_orchestrator.routers.responses.responses import (
    ErrorResponse,
    LLMProviderResponse,
    ProviderSettingStatusResponse,
)
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
    request: Request, provider_id: str, query: LLMProviderSettingStatusQuery
) -> ProviderSettingStatusResponse:
    # Query validation
    validate_query(request, provider_id, query.setting)

    try:
        # LLM setting check
        check_llm_setting(query.setting)

        return ProviderSettingStatusResponse(valid=True)
    except BusinessException as exc:
        logger.error(exc)
        return ProviderSettingStatusResponse(errors=[create_error_response(exc)])


def validate_query(request: Request, provider_id: str, setting: LLMSetting):
    if not LLMProvider.has_value(provider_id):
        raise UnknownProviderException(
            create_error_info_not_found(
                request, provider_id, [provider.value for provider in LLMProvider]
            )
        )
    elif provider_id != setting.provider:
        raise InvalidQueryException(create_error_info_bad_request(request, provider_id))
