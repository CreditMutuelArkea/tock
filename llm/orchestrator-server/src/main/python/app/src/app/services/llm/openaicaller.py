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
from ...models.llm.openai.openaisetting import OpenAISetting
from .llmcaller import LLMCaller


class OpenAICaller(LLMCaller):
    def checkSetting(self, setting: OpenAISetting, isEmbeddingModel: bool):
        return True

    def getLanguageModel(self, setting: OpenAISetting):
        return 'LanguageModel[OpenAICaller]'

    def getEmbeddingModel(self, setting: OpenAISetting):
        return 'EmbeddingModel[OpenAICaller]'
