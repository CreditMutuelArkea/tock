from ...models.llm.azureopenai.azureopenaisetting import AzureOpenAISetting
from .llmcaller import LLMCaller


class AzureOpenAICaller(LLMCaller):

    def checkSetting(self, setting: AzureOpenAISetting, isEmbeddingModel: bool):
        return False

    def getLanguageModel(self, setting: AzureOpenAISetting):
        return "LanguageModel[AzureOpenAICaller]"

    def getEmbeddingModel(self, setting: AzureOpenAISetting):
        return "EmbeddingModel[AzureOpenAICaller]"
