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
from llm_orchestrator.exceptions.ErrorCode import ErrorCode
from llm_orchestrator.exceptions.FunctionalException import FunctionalException
from llm_orchestrator.models.chat import QueryAI
from llm_orchestrator.models.footnotes import FootNote
from llm_orchestrator.models.llm.azureopenai.azureopenaisetting import (
    AzureOpenAISetting,
)
from llm_orchestrator.models.llm.llmsetting import LLMSetting
from llm_orchestrator.models.llm.openai.openaisetting import OpenAISetting
from llm_orchestrator.services.llm.azureopenaicaller import AzureOpenAICaller
from llm_orchestrator.services.llm.openaicaller import OpenAICaller

# In think it would be great to name filed RAGChain of something that includes RAG in the naming.
# For me we will have RagChain / RagService that uses langchain conversationnal QA
# but also syntheticSentenceGenerationChain
# that will generate derivate of sentence and use langchain list formatter.


def executeChain(query: QueryAI):
    caller = create_llm_caller(query.llmSetting)
    embeddingCaller = create_llm_caller(query.llmSettingEmbedding)

    # Fake answer
    return {
        'answer': {
            'text': caller.getLanguageModel(query.llmSetting)
            + ' '
            + embeddingCaller.getEmbeddingModel(query.llmSettingEmbedding),
            'footnotes': [FootNote('1', 'title1', 'url1'), FootNote('2', 'title2')],
        },
        'debug': [],
    }


def create_llm_caller(setting: LLMSetting):
    if isinstance(setting, OpenAISetting):
        return OpenAICaller()
    elif isinstance(setting, AzureOpenAISetting):
        return AzureOpenAICaller()
    else:
        raise FunctionalException(ErrorCode.E10)
