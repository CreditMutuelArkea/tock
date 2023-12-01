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
from llm_orchestrator.models.rag.rag_models import FootNote, TextWithFootNotes
from llm_orchestrator.routers.requests.requests import RagQuery
from llm_orchestrator.routers.responses.responses import RagResponse
from llm_orchestrator.services.langchain.factories.langchain_factory import (
    get_em_factory,
    get_llm_factory,
)
from langchain.base_language import BaseLanguageModel
from langchain.schema import AIMessage

# In think it would be great to name filed RAGChain of something that includes RAG in the naming.
# For me we will have RagChain / RagService that uses langchain conversationnal QA
# but also syntheticSentenceGenerationChain
# that will generate derivate of sentence and use langchain list formatter.


def execute_chain(query: RagQuery, debug: bool) -> RagResponse:
    llm_factory = get_llm_factory(query.rephrasing_answer_llm_setting)
    em_factory = get_em_factory(query.embedding_question_em_setting)

    # Instantiate LangChain, using :
    # llm_factory.get_language_model()
    # em_factory.get_embedding_model()

    # Fake answer
    return RagResponse(
        answer=TextWithFootNotes(
            text='{} - {} - {}'.format(
                llm_factory.get_language_model(),
                em_factory.get_embedding_model(),
                debug,
            ),
            footnotes=[
                FootNote(identifier='1', title='title1', url='url1'),
                FootNote(identifier='2', title='title2'),
            ],
        ),
        debug=[],
    )


def llm_inference(llm: BaseLanguageModel, prompt: str) -> AIMessage:
    return llm.invoke(prompt)
