from typing import Any

from ..llmsetting import LLMSetting
from ..llmprovider import LLMProvider


class OpenAISetting(LLMSetting):
    def __init__(self, apiKey, model, temperature=None, prompt=None, **kwargs: Any):
        super().__init__(LLMProvider.OPEN_AI, apiKey, model, temperature, prompt)
