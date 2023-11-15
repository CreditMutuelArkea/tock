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
from fastapi import APIRouter, Depends

from llm_orchestrator.models.chat import ChatQuery
from llm_orchestrator.routers.dependencies import (
    get_query_bot_id,
    get_query_conversation_id,
)
from llm_orchestrator.services.llm.llmservice import ask

router = APIRouter(
    prefix='/chat',
    tags=['Chat'],
    dependencies=[Depends(get_query_bot_id), Depends(get_query_conversation_id)],
)


@router.post('/')
async def chat(botId: str, conversationId: str, query: ChatQuery):
    return ask(botId, conversationId, query.llmSetting, query.llmSettingEmbedding)
