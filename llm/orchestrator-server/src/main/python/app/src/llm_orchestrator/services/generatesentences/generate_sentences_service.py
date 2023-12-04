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
from llm_orchestrator.services.langchain.factories.langchain_factory import get_llm_factory
from langchain.output_parsers import CommaSeparatedListOutputParser
from llm_orchestrator.services.llm.llm_service import format_prompt_with_parser, parse_llm_output_content, llm_inference
from llm_orchestrator.routers.responses.responses import GenerateSentencesResponse
from llm_orchestrator.routers.requests.requests import GenerateSentencesQuery


def generate_and_split_sentences(query: GenerateSentencesQuery) -> GenerateSentencesResponse:
    """
       Generate sentences using a language model based on the provided query,
       and split the generated content into a list of sentences using a specific parser.

       :param query: A GenerateSentencesQuery object containing the llm setting.
       :return: A GenerateSentencesResponse object containing the list of sentences.
    """

    llm_factory = get_llm_factory(query.llm_setting)
    llm = llm_factory.get_language_model()

    parser = CommaSeparatedListOutputParser()
    prompt = format_prompt_with_parser(prompt=query.llm_setting.prompt, parser=parser)
    sentences = llm_inference(llm=llm, prompt=prompt)
    parse_llm_output_content(llm_output=sentences, parser=parser)

    return GenerateSentencesResponse(
        sentences=sentences.content
    )
