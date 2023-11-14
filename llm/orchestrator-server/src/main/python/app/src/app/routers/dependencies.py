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

from ..exceptions.ErrorCode import ErrorCode
from ..exceptions.FunctionalException import FunctionalException


async def get_query_bot_id(botId: Union[str, None]):
    if not botId:
        raise FunctionalException(ErrorCode.E30)


async def get_query_conversation_id(conversationId: str):
    if not conversationId:
        raise FunctionalException(ErrorCode.E40)
