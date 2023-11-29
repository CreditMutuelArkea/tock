#  Copyright (C) 2017/2021 e-voyageurs technologies
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

from llm_orchestrator.services.langchain.factories.langchain_factory import get_llm_factory
from llm_orchestrator.models.llm.llm_types import LLMSetting
from langchain.base_language import BaseLanguageModel
from langchain.output_parsers import CommaSeparatedListOutputParser


def get_sentences(
    bot_id: str, conversation_id: str, llm_setting: LLMSetting, debug: bool
):
    llm_factory = get_llm_factory(llm_setting)

    llm = llm_factory.get_language_model()

    return {
        'sentences': generate_formatted_sentences(llm=llm, prompt=llm_setting.prompt)
    }


def generate_formatted_sentences(llm: BaseLanguageModel, prompt: str):
    output_parser = CommaSeparatedListOutputParser()
    format_instructions = output_parser.get_format_instructions()

    prompt = prompt + "\n" + format_instructions
    sentences = llm.invoke(prompt)

    return output_parser.parse(sentences.content)