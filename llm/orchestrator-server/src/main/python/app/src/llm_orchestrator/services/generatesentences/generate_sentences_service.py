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


from llm_orchestrator.routers.requests.requests import GenerateSentencesQuery
from llm_orchestrator.routers.responses.responses import (
    GenerateSentencesResponse,
)
from langchain.output_parsers import NumberedListOutputParser

from llm_orchestrator.services.langchain.factories.langchain_factory import (
    get_llm_factory,
)
from langchain.prompts import PromptTemplate

def generate_and_split_sentences(
    query: GenerateSentencesQuery,
) -> GenerateSentencesResponse:
    """
    Generate sentences using a language model based on the provided query,
    and split the generated content into a list of sentences using a specific parser.

    :param query: A GenerateSentencesQuery object containing the llm setting.
    :return: A GenerateSentencesResponse object containing the list of sentences.
    """

    llm_factory = get_llm_factory(query.llm_setting)
    # validate_jinja2(template, input_variables=["input_language", "content"])
    # il faudrait faire la validation mais la remonté d'erreur se fait via log et c pas ouf
    parser = NumberedListOutputParser()
    prompt = PromptTemplate.from_template(query.prompt.template,  template_format=query.prompt.formatter)
    model = llm_factory.get_language_model()

    chain = prompt | model | parser
    sentences = chain.invoke(query.prompt.inputs)

    return GenerateSentencesResponse(sentences=sentences)