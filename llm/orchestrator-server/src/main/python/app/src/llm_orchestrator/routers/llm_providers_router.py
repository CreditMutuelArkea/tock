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
from llm_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.models.llm.llm_types import LLMSetting
from llm_orchestrator.models.llm.openai.openai_llm_setting import (
    OpenAILLMSetting,
)
from llm_orchestrator.services.llm.llm_service import check_llm_setting

router = APIRouter(
    prefix='/llm-providers',
    tags=['Large Language Model Providers'],
    dependencies=[Depends(get_token_header)],
    responses={404: {'description': 'Not found'}},
)


@router.get('')
async def get_all_llm_providers() -> list[str]:
    return [provider.value for provider in LLMProvider]


@router.get('/{provider_id}')
async def get_llm_provider_by_id(provider_id: str) -> bool:
    return LLMProvider.has_value(provider_id)


@router.get('/{provider_id}/settings')
async def get_llm_provider_settings_by_id(provider_id: str) -> Union[LLMSetting, None]:
    if provider_id == LLMProvider.OPEN_AI.value:
        return OpenAILLMSetting(
            provider=LLMProvider.OPEN_AI,
            apiKey='apiKey',
            model='model',
            temperature='1.3',
            prompt='ppp',
        )
    elif provider_id == LLMProvider.AZURE_OPEN_AI_SERVICE.value:
        return AzureOpenAILLMSetting(
            provider=LLMProvider.AZURE_OPEN_AI_SERVICE,
            apiKey='apiKey',
            model='model',
            deploymentName='deploymentName',
            apiBase='apiBase',
            apiVersion='apiVersion',
            temperature='0.7',
            prompt='prompt',
        )
    else:
        return None


@router.post('/{provider_id}/settings')
async def check_llm_provider_settings_by_id(
    provider_id: str, setting: LLMSetting
) -> bool:
    try:
        return check_llm_setting(provider_id, setting)
    except FunctionalException as e:
        raise HTTPException(status_code=400, detail=e.args[0])
