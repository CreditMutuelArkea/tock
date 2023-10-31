from ...exceptions.ErrorCode import ErrorCode
from ...exceptions.FunctionalException import FunctionalException
from ...models.chat import QueryAI
from ...models.llm.azureopenai.azureopenaisetting import AzureOpenAISetting
from ...models.llm.llmprovider import LLMProvider
from ...models.llm.llmsetting import LLMSetting
from ...models.llm.openai.openaisetting import OpenAISetting
from ...services.langchain.langchain import executeChain
from ...services.llm.azureopenaicaller import AzureOpenAICaller
from ...services.llm.openaicaller import OpenAICaller


def checkLLMSetting(setting: dict, isEmbeddingModel: bool):
    return __check_llm_setting(create_instance(setting), isEmbeddingModel)


def __check_llm_setting(setting: LLMSetting, isEmbeddingModel: bool):
    if isinstance(setting, OpenAISetting):
        return OpenAICaller().checkSetting(setting, isEmbeddingModel)
    elif isinstance(setting, AzureOpenAISetting):
        return AzureOpenAICaller().checkSetting(setting, isEmbeddingModel)
    else:
        raise FunctionalException(ErrorCode.E10)


def ask(botId: str, conversationId: str, setting: dict, embeddingSetting):
    llm_setting = create_instance(setting)
    llm_embedding_setting = create_instance(embeddingSetting)
    return executeChain(QueryAI(botId, conversationId, llm_setting, llm_embedding_setting))


def create_instance(setting: dict):
    provider = setting.get("provider")
    if provider == LLMProvider.OPEN_AI.value:
        return OpenAISetting(**setting)
    elif provider == LLMProvider.AZURE_OPEN_AI_SERVICE.value:
        return AzureOpenAISetting(**setting)
    else:
        raise FunctionalException(ErrorCode.E20)
