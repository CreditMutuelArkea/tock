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
from pydantic import BaseModel, Field

from llm_orchestrator.models.em.em_provider import EMProvider


class BaseEMSetting(BaseModel):
    provider: EMProvider = Field(
        description='The Embedding Model Provider.', examples=[EMProvider.OPEN_AI]
    )
    api_key: str = Field(
        description='The API key used to authenticate requests to the AI Provider API.',
        examples=['ab7***************************A1IV4B'],
    )
