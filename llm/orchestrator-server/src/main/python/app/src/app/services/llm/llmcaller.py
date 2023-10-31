from abc import ABC, abstractmethod
from ...models.llm.llmsetting import LLMSetting


class LLMCaller(ABC):  # LLMFactory

    @abstractmethod
    def checkSetting(self, setting: LLMSetting, isEmbeddingModel: bool):
        """
        check the setting validity
        :param setting: the LLM setting
        :param isEmbeddingModel: Is it an embedding model
        :return: [BaseLanguageModel] the interface for Language models.
        """
        pass

    @abstractmethod
    def getLanguageModel(self, setting: LLMSetting):
        """
        Fabric the language model to call.
        :param setting: the LLM setting
        :return: [BaseLanguageModel] the interface for Language models.
        """
        pass

    @abstractmethod
    def getEmbeddingModel(self, setting: LLMSetting):
        """
        Embedding model to call.
        :param setting: the LLM setting
        :return: [Embeddings] the interface for embedding models.
        """
        pass

