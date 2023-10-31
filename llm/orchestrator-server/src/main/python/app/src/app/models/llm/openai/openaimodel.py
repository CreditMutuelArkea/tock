from enum import Enum, unique


@unique
class OpenAIModel(Enum):
    # GPT-4
    GPT_4 = 'gpt-4'
    GPT_4_0314 = 'gpt-4-0314'
    GPT_4_0613 = 'gpt-4-0613'
    GPT_4_32K = 'gpt-4-32k'
    GPT_4_32K_0314 = 'gpt-4-32k-0314'
    GPT_4_32K_0613 = 'gpt-4-32k-0613'

    # GTP-3.5
    GPT_35_TURBO = 'gpt-3.5-turbo'
    GPT_35_TURBO_0613 = 'gpt-3.5-turbo-0613'
    GPT_35_TURBO_16K = 'gpt-3.5-turbo-16k'
    GPT_35_TURBO_16K_0613 = 'gpt-3.5-turbo-16k-0613'
    GPT_35_TURBO_INSTRUCT = 'gpt-3.5-turbo-instruct'

    # GPT base
    GPT_BASE_BABBAGE = 'babbage-002'
    GPT_BASE_DAVINCI = 'davinci-002'

    # Embeddings
    TEXT_EMBEDDING_ADA_002 = 'text-embedding-ada-002'
