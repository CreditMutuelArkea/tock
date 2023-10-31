from fastapi import APIRouter, Depends

from ..models.chat import ChatQuery
from ..services.llm.llmservice import ask
from .dependencies import get_query_bot_id, get_query_conversation_id

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    dependencies=[Depends(get_query_bot_id), Depends(get_query_conversation_id)]
)


@router.post("/")
async def chat(botId: str, conversationId: str, query: ChatQuery):
    return ask(botId, conversationId, query.llmSetting, query.llmSettingEmbedding)
