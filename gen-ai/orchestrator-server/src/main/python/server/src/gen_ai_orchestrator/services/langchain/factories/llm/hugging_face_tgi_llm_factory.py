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
"""Model for creating HuggingFaceTGILLMFactory"""

from langchain.base_language import BaseLanguageModel
from langchain_community.llms import HuggingFaceEndpoint

from gen_ai_orchestrator.configurations.environement.settings import (
    application_settings,
)
from gen_ai_orchestrator.errors.handlers.huggingfacetgi.hugging_face_exception_handler import (
    hugging_face_exception_handler,
)
from gen_ai_orchestrator.models.llm.huggingfacetgi.hugging_face_tgi_llm_setting import (
    HuggingFaceTGILLMSetting,
)
from gen_ai_orchestrator.services.langchain.factories.llm.llm_factory import (
    LangChainLLMFactory,
)


class HuggingFaceTGILLMFactory(LangChainLLMFactory):
    """A class for LangChain Hugging Face LLM Factory"""

    setting: HuggingFaceTGILLMSetting

    def get_language_model(self) -> BaseLanguageModel:
        return HuggingFaceEndpoint(
            endpoint_url=self.settings.api_base,
            temperature=self.settings.temperature,
            repetition_penalty=self.settings.repetition_penalty,
            max_new_tokens=self.settings.max_new_tokens,
        )

    @hugging_face_exception_handler(provider='HuggingFaceTGI')
    def check_llm_setting(self) -> bool:
        return super().check_llm_setting()
