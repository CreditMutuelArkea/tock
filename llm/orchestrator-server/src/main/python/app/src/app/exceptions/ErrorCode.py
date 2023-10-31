from enum import Enum, unique


@unique
class ErrorCode(Enum):
    E10 = 'Unknown LLM Setting'
    E20 = 'Unknown LLM Provider'
    E30 = 'No Bot Id provided'
    E40 = 'No Conversation Id provided'
