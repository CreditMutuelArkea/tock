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
from llm_orchestrator.exceptions.FunctionalException import FunctionalException
from llm_orchestrator.models.llm.llmprovider import LLMProvider
from llm_orchestrator.services.llm.llmservice import checkLLMSetting

router = APIRouter(
    prefix='/llm',
    tags=['LLM'],
    dependencies=[Depends(get_token_header)],
    responses={404: {'description': 'Not found'}},
)


@router.get('/')
async def listLLMs():
    return [provider.value for provider in LLMProvider]


@router.get('/{providerId}')
async def getLLM(providerId: str):
    return LLMProvider.has_value(providerId)


@router.post('/check-setting')
async def checkSetting(setting: dict, isEmbeddingModel: bool = False):
    try:
        return checkLLMSetting(setting, isEmbeddingModel)
    except FunctionalException as e:
        raise HTTPException(status_code=400, detail=e.args[0])
