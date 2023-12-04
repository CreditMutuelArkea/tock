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

from llm_orchestrator.models.llm.llm_provider import LLMProvider


class BaseLLMSetting(BaseModel):
    provider: LLMProvider = Field(description='The Large Language Model provider.')
    api_key: str = Field(
        description='The API key used to authenticate requests to the provider API.',
        examples=['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'],
    )
    model: str = Field(description='The model id', examples=['gpt-3.5-turbo'])
    temperature: float = Field(
        description='The temperature that controls the randomness of the text generated.',
        examples=['1.2'],
        ge=0,
        le=2,
    )
    prompt: str = Field(
        description='The prompt to generate completions for.',
        examples=['How to learn to ride a bike without wheels!'],
    )
