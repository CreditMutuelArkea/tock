from dataclasses import dataclass
from .llm.llmsetting import LLMSetting


@dataclass
class ChatQuery:
    llmSetting: dict
    llmSettingEmbedding: dict


@dataclass
class QueryAI:
    botId: str
    conversationId: str
    llmSetting: LLMSetting
    llmSettingEmbedding: LLMSetting
    debug: bool = False
