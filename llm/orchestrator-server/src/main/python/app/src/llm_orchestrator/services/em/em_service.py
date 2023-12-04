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
from llm_orchestrator.exceptions.business_exception import BusinessException
from llm_orchestrator.exceptions.error_code import ErrorCode
from llm_orchestrator.models.em.em_types import EMSetting
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.services.langchain.factories.langchain_factory import (
    get_em_factory,
)


def check_em_setting(provider_id: str, setting: EMSetting) -> bool:
    if LLMProvider.has_value(provider_id):
        return get_em_factory(setting).check_embedding_model_setting()
    else:
        raise BusinessException(ErrorCode.E21)