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
"""Model for creating OllamaLLMSetting."""

from typing import Literal

from pydantic import Field

from gen_ai_orchestrator.models.llm.llm_provider import LLMProvider
from gen_ai_orchestrator.models.llm.llm_setting import BaseLLMSetting


class OllamaLLMSetting(BaseLLMSetting):
    """
    A class for Ollama Large Language Model Setting.
    Usage docs: https://github.com/ollama/ollama/blob/main/docs/README.md
    """

    provider: Literal[LLMProvider.OLLAMA] = Field(
        description='The Large Language Model Provider.', examples=[LLMProvider.OLLAMA]
    )
    model: str = Field(
        description='The model id', examples=['llama2'], min_length=1
    )
    base_url: str = Field(
        description='The model id',
        examples=["http://localhost:11434"],
        default="http://localhost:11434"
    )
