from typing import Union
from ..exceptions.FunctionalException import FunctionalException
from ..exceptions.ErrorCode import ErrorCode


async def get_query_bot_id(botId: Union[str, None]):
    if not botId:
        raise FunctionalException(ErrorCode.E30)


async def get_query_conversation_id(conversationId: str):
    if not conversationId:
        raise FunctionalException(ErrorCode.E40)
