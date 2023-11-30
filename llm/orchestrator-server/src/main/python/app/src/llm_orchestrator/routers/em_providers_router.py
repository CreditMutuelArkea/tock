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

from fastapi import APIRouter, Depends, HTTPException

from llm_orchestrator.dependencies import get_token_header
from llm_orchestrator.exceptions.error_code import ErrorCode
from llm_orchestrator.exceptions.functional_exception import (
    FunctionalException,
)
from llm_orchestrator.models.em.azureopenai.azure_openai_em_setting import (
    AzureOpenAIEMSetting,
)
from llm_orchestrator.models.em.em_types import EMSetting
from llm_orchestrator.models.em.openai.openai_em_setting import OpenAIEMSetting
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.services.em.em_service import check_em_setting

em_providers_router = APIRouter(
    prefix='/em-providers',
    tags=['Embedding Model Providers'],
    dependencies=[Depends(get_token_header)],
    responses={404: {'description': 'Not found'}},
)


@em_providers_router.get('')
async def get_all_em_providers() -> list[LLMProvider]:
    return [provider.value for provider in LLMProvider]


@em_providers_router.get('/{provider_id}')
async def get_em_provider_by_id(provider_id: LLMProvider) -> bool:
    return LLMProvider.has_value(provider_id)


@em_providers_router.get('/{provider_id}/setting')
async def get_em_provider_setting_by_id(provider_id: LLMProvider) -> EMSetting:
    if provider_id == LLMProvider.OPEN_AI:
        return OpenAIEMSetting(
            provider=LLMProvider.OPEN_AI, api_key='api_key', model='model'
        )
    elif provider_id == LLMProvider.AZURE_OPEN_AI_SERVICE:
        return AzureOpenAIEMSetting(
            provider=LLMProvider.AZURE_OPEN_AI_SERVICE,
            api_key='api_key',
            model='model',
            deployment_name='deployment_name',
            api_base='api_base',
            api_version='api_version',
        )
    else:
        raise HTTPException(status_code=400, detail=ErrorCode.E20)


@em_providers_router.post('/{provider_id}/setting')
async def check_em_provider_setting_by_id(provider_id: str, setting: EMSetting) -> bool:
    try:
        return check_em_setting(provider_id, setting)
    except FunctionalException as e:
        raise HTTPException(status_code=400, detail=e.args[0])
