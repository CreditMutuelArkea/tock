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
from src.main.python.app.src.app.exceptions.ErrorCode import ErrorCode
from src.main.python.app.src.app.exceptions.FunctionalException import (
    FunctionalException,
)
from src.main.python.app.src.app.models.chat import QueryAI
from src.main.python.app.src.app.models.footnotes import FootNote
from src.main.python.app.src.app.models.llm.azureopenai.azureopenaisetting import (
    AzureOpenAISetting,
)
from src.main.python.app.src.app.models.llm.llmsetting import LLMSetting
from src.main.python.app.src.app.models.llm.openai.openaisetting import (
    OpenAISetting,
)
from src.main.python.app.src.app.services.llm.azureopenaicaller import (
    AzureOpenAICaller,
)
from src.main.python.app.src.app.services.llm.openaicaller import OpenAICaller


def executeChain(query: QueryAI):
    caller = create_llm_caller(query.llmSetting)
    embeddingCaller = create_llm_caller(query.llmSettingEmbedding)

    # Fake answer
    return {
        "answer": {
            "text": caller.getLanguageModel(query.llmSetting)
            + " "
            + embeddingCaller.getEmbeddingModel(query.llmSettingEmbedding),
            "footnotes": [FootNote("1", "title1", "url1"), FootNote("2", "title2")],
        },
        "debug": [],
    }


def create_llm_caller(setting: LLMSetting):
    if isinstance(setting, OpenAISetting):
        return OpenAICaller()
    elif isinstance(setting, AzureOpenAISetting):
        return AzureOpenAICaller()
    else:
        raise FunctionalException(ErrorCode.E10)
