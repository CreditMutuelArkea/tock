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
"""Model for creating AzureOpenAILLMFactory"""
from typing import Optional

from langchain.base_language import BaseLanguageModel
from langchain_openai import AzureChatOpenAI
from langchain_core.runnables import RunnableConfig
from langchain_core.runnables.utils import Input, Output

from gen_ai_orchestrator.configurations.environement.settings import application_settings
from gen_ai_orchestrator.errors.handlers.openai.openai_exception_handler import (
    openai_exception_handler,
)
from gen_ai_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from gen_ai_orchestrator.services.langchain.factories.llm.llm_factory import (
    LangChainLLMFactory,
)


class AzureOpenAILLMFactory(LangChainLLMFactory):
    """A class for LangChain Azure OpenAI LLM Factory"""

    setting: AzureOpenAILLMSetting

    def get_language_model(self) -> BaseLanguageModel:
        return AzureChatOpenAI(
            openai_api_key=self.setting.api_key,
            openai_api_version=self.setting.api_version,
            azure_endpoint=str(self.setting.api_base),
            azure_deployment=self.setting.deployment_name,
            temperature=self.setting.temperature,
            request_timeout=application_settings.llm_provider_timeout
        )

    @openai_exception_handler(provider='AzureOpenAIService')
    def invoke(self, _input: Input, config: Optional[RunnableConfig] = None) -> Output:
        return super().invoke(_input, config)
