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
from langchain.schema import BaseOutputParser, AIMessage


def check_llm_setting(provider_id: str, setting: LLMSetting) -> bool:
    if LLMProvider.has_value(provider_id):
        return get_llm_factory(setting).check_llm_setting()
    else:
        raise FunctionalException(ErrorCode.E20)


def format_prompt_with_parser(prompt: str, parser: BaseOutputParser) -> str:
    """
        Add format instructions in the prompt based on the given parser.

        :param prompt: The original prompt string to which format instructions will be added.
        :param parser: An instance of the BaseOutputParser class providing format instructions.

        :return: A new prompt string with added format instructions.
    """

    format_instructions = parser.get_format_instructions()
    formatted_prompt = prompt + "\n" + format_instructions
    return formatted_prompt


def parse_llm_output_content(llm_output: AIMessage, parser: BaseOutputParser):
    """
        Parse the content of an AIMessage (output of an LLM invoke()) using the provided BaseOutputParser.

        :param llm_output: LLM output whose content will be parsed.
        :param parser: An instance of the BaseOutputParser class used for parsing.
    """

    llm_output.content = parser.parse(llm_output.content)


def llm_inference(llm: BaseLanguageModel, prompt: str) -> AIMessage:
    """
        Inference of the LLM using the given prompt.

        :param llm: the LLM build from the factory
        :param prompt: the prompt we want to inject into
    """

    return llm.invoke(prompt)
