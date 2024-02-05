#   Copyright (C) 2023-2024 Credit Mutuel Arkea
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
"""Model for creating OpenAILLMSetting."""

from typing import Literal

from pydantic import Field

from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.models.llm.llm_setting import BaseLLMSetting


class OpenAILLMSetting(BaseLLMSetting):
    """
    A class for OpenAI Large Language Model Setting.
    Usage docs: https://platform.openai.com/docs/models
    """

    provider: Literal[LLMProvider.OPEN_AI] = Field(
        description='The Large Language Model Provider.', examples=[LLMProvider.OPEN_AI]
    )
    model: str = Field(
        description='The model id', examples=['gpt-3.5-turbo'], min_length=1
    )
