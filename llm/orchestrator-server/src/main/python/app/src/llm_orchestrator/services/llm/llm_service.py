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

from langchain.schema import AIMessage, BaseOutputParser
from langchain.schema.language_model import BaseLanguageModel

from llm_orchestrator.exceptions.error_code import ErrorCode
from llm_orchestrator.exceptions.functional_exception import (
    FunctionalException,
)
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.models.llm.llm_types import LLMSetting
from llm_orchestrator.services.langchain.factories.langchain_factory import (
    get_llm_factory,
)


def check_llm_setting(provider_id: str, setting: LLMSetting) -> bool:
    if LLMProvider.has_value(provider_id):
        return get_llm_factory(setting).check_llm_setting()
    else:
        raise FunctionalException(ErrorCode.E20)


def llm_inference_with_parser(
    llm: BaseLanguageModel, prompt: str, parser: BaseOutputParser
) -> AIMessage:
    """
    Perform LLM inference and format the output content based on the given parser.

    :param llm: LLM Factory model.
    :param prompt: Input prompt.
    :param parser: Parser to format the output.

    :return: Result of the language model inference with the content formatted.
    """

    # Change the prompt with added format instructions
    format_instructions = parser.get_format_instructions()
    formatted_prompt = prompt + '\n' + format_instructions

    # Inference of the LLM with the formatted prompt
    llm_output = llm.invoke(formatted_prompt)

    # Apply the parsing on the LLM output
    llm_output.content = parser.parse(llm_output.content)

    return llm_output
