from typing import Any

from ..llmsetting import LLMSetting
from ..llmprovider import LLMProvider


class AzureOpenAISetting(LLMSetting):
    def __init__(self, apiKey, model, deploymentName, privateEndpointBaseUrl, apiVersion, temperature=None, prompt=None,
                 **kwargs: Any):
        super().__init__(LLMProvider.AZURE_OPEN_AI_SERVICE, apiKey, model, temperature, prompt)
        self.deploymentName = deploymentName
        self.privateEndpointBaseUrl = privateEndpointBaseUrl
        self.apiVersion = apiVersion
