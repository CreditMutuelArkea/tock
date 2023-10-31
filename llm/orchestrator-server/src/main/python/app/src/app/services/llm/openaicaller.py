from .llmcaller import LLMCaller
from ...models.llm.openai.openaisetting import OpenAISetting


class OpenAICaller(LLMCaller):

    def checkSetting(self, setting: OpenAISetting, isEmbeddingModel: bool):
        return True

    def getLanguageModel(self, setting: OpenAISetting):
        return "LanguageModel[OpenAICaller]"

    def getEmbeddingModel(self, setting: OpenAISetting):
        return "EmbeddingModel[OpenAICaller]"
