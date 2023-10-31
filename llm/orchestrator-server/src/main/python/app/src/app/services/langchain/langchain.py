from ...models.footnotes import FootNote
from ...models.chat import QueryAI
from ...services.llm.openaicaller import OpenAICaller
from ...services.llm.azureopenaicaller import AzureOpenAICaller
from ...models.llm.openai.openaisetting import OpenAISetting
from ...models.llm.azureopenai.azureopenaisetting import AzureOpenAISetting
from ...models.llm.llmsetting import LLMSetting
from ...exceptions.FunctionalException import FunctionalException
from ...exceptions.ErrorCode import ErrorCode


def executeChain(query: QueryAI):
    caller = create_llm_caller(query.llmSetting)
    embeddingCaller = create_llm_caller(query.llmSettingEmbedding)

    # Fake answer
    return \
        {
            "answer": {
                "text": caller.getLanguageModel(query.llmSetting) + ' ' + embeddingCaller.getEmbeddingModel(query.llmSettingEmbedding),
                "footnotes": [
                    FootNote("1", "title1", "url1"),
                    FootNote("2", "title2")
                    ]
            },
            "debug": []
        }


def create_llm_caller(setting: LLMSetting):
    if isinstance(setting, OpenAISetting):
        return OpenAICaller()
    elif isinstance(setting, AzureOpenAISetting):
        return AzureOpenAICaller()
    else:
        raise FunctionalException(ErrorCode.E10)
