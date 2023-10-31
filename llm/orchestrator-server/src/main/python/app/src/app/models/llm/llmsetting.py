from typing import Union
from .llmprovider import LLMProvider


class LLMSetting:

    def __init__(self, provider, apiKey, model, temperature, prompt):
        self.provider = provider
        self.apiKey = apiKey
        self.model = model
        self.temperature = temperature
        self.prompt = prompt

