from enum import Enum, unique


@unique
class LLMProvider(Enum):
    OPEN_AI = 'OpenAI'
    AZURE_OPEN_AI_SERVICE = 'AzureOpenAIService'

    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_
