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

from langchain.base_language import BaseLanguageModel
from langchain.chat_models import AzureChatOpenAI

from llm_orchestrator.errors.handlers.openai.openai_exception_handler import (
    openai_exception_handler,
)
from llm_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from llm_orchestrator.services.langchain.factories.llm.llm_factory import (
    LangChainLLMFactory,
)


class AzureOpenAILLMFactory(LangChainLLMFactory):
    setting: AzureOpenAILLMSetting

    def get_language_model(self) -> BaseLanguageModel:
        return AzureChatOpenAI(
            openai_api_key=self.setting.api_key,
            openai_api_version=self.setting.api_version,
            azure_endpoint=str(self.setting.api_base),
            azure_deployment=self.setting.deployment_name,
            temperature=self.setting.temperature,
        )

    @openai_exception_handler(provider='AzureOpenAIService')
    def check_llm_setting(self) -> bool:
        return super().check_llm_setting()
