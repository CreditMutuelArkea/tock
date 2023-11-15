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
from abc import ABC, abstractmethod

from langchain.base_language import BaseLanguageModel
from langchain.embeddings.base import Embeddings

from llm_orchestrator.models.llm.llmsetting import LLMSetting


class LLMCaller(ABC):  # LLMFactory
    @abstractmethod
    def checkSetting(self, setting: LLMSetting, isEmbeddingModel: bool) -> bool:
        """
        check the setting validity
        :param setting: the LLM setting
        :param isEmbeddingModel: Is it an embedding model
        :return: True if the setting is valid.
        """
        pass

    @abstractmethod
    def getLanguageModel(self, setting: LLMSetting) -> BaseLanguageModel:
        """
        Fabric the language model to call.
        :param setting: the LLM setting
        :return: [BaseLanguageModel] the interface for Language models.
        """
        pass

    @abstractmethod
    def getEmbeddingModel(self, setting: LLMSetting) -> Embeddings:
        """
        Embedding model to call.
        :param setting: the LLM setting
        :return: [Embeddings] the interface for embedding models.
        """
        pass
