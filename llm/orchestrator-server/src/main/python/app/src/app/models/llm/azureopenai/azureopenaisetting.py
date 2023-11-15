#   Copyright (C) 2023 Credit Mutuel Arkea
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
from typing import Any

from src.main.python.app.src.app.models.llm.llmprovider import LLMProvider
from src.main.python.app.src.app.models.llm.llmsetting import LLMSetting


class AzureOpenAISetting(LLMSetting):
    def __init__(
        self,
        apiKey,
        model,
        deploymentName,
        privateEndpointBaseUrl,
        apiVersion,
        temperature=None,
        prompt=None,
        **kwargs: Any
    ):
        super().__init__(
            LLMProvider.AZURE_OPEN_AI_SERVICE, apiKey, model, temperature, prompt
        )
        self.deploymentName = deploymentName
        self.privateEndpointBaseUrl = privateEndpointBaseUrl
        self.apiVersion = apiVersion
