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
from typing import Union

from fastapi import APIRouter, Depends, HTTPException

from llm_orchestrator.dependencies import get_token_header
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

router = APIRouter(
    prefix='/em-providers',
    tags=['Embedding Model Providers'],
    dependencies=[Depends(get_token_header)],
    responses={404: {'description': 'Not found'}},
)


@router.get('')
async def get_all_em_providers() -> list[str]:
    return [provider.value for provider in LLMProvider]


@router.get('/{provider_id}')
async def get_em_provider_by_id(provider_id: str) -> bool:
    return LLMProvider.has_value(provider_id)


@router.get('/{provider_id}/settings')
async def get_em_provider_settings_by_id(provider_id: str) -> Union[EMSetting, None]:
    if provider_id == LLMProvider.OPEN_AI.value:
        return OpenAIEMSetting(
            provider=LLMProvider.OPEN_AI, apiKey='apiKey', model='model'
        )
    elif provider_id == LLMProvider.AZURE_OPEN_AI_SERVICE.value:
        return AzureOpenAIEMSetting(
            provider=LLMProvider.AZURE_OPEN_AI_SERVICE,
            apiKey='apiKey',
            model='model',
            deploymentName='deploymentName',
            apiBase='apiBase',
            apiVersion='apiVersion',
        )
    else:
        return None


@router.post('/{provider_id}/settings')
async def check_em_provider_settings_by_id(
    provider_id: str, setting: EMSetting
) -> bool:
    try:
        return check_em_setting(provider_id, setting)
    except FunctionalException as e:
        raise HTTPException(status_code=400, detail=e.args[0])
