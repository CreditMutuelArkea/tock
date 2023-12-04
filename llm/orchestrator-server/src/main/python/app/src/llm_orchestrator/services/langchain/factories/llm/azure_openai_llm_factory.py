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

from langchain.base_language import BaseLanguageModel
from langchain.chat_models import AzureChatOpenAI
from openai import AuthenticationError, NotFoundError

from llm_orchestrator.exceptions.business_exception import (
    AuthenticationProviderException,
    UnknownAzureDeploymentException,
    UnknownAzureVersionException,
)
from llm_orchestrator.exceptions.exception_handlers import extract_error
from llm_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from llm_orchestrator.models.llm.llm_provider import LLMProvider
from llm_orchestrator.services.langchain.factories.llm.llm_factory import (
    LangChainLLMFactory,
)


class AzureOpenAILLMFactory(LangChainLLMFactory):
    setting: AzureOpenAILLMSetting

    def check_llm_setting(self) -> bool:
        prompt = (
            'Hi, are you here ?'  # TODO MASS: Dois-je utiliser le prompt du setting ?
        )
        try:
            m = self.get_language_model()
            res = m.invoke(prompt)
            return True
        except AuthenticationError as e:
            raise AuthenticationProviderException(
                {
                    'provider_type': 'LLM',
                    'provider_id': LLMProvider.AZURE_OPEN_AI_SERVICE,
                    'detail': extract_error(e.message),
                }
            )
        except NotFoundError as e:
            if e.message.__contains__(
                'DeploymentNotFound'
            ):  # TODO MASS : How to improve ?
                raise UnknownAzureDeploymentException(
                    {
                        'provider_type': 'LLM',
                        'provider_id': LLMProvider.AZURE_OPEN_AI_SERVICE,
                        'detail': extract_error(e.message),
                    }
                )

            if e.message.__contains__(
                '404'
            ):  # TODO MASS : bizarre, ca passe ici, alor on a fait un raise avant
                raise UnknownAzureVersionException(
                    {
                        'provider_type': 'LLM',
                        'provider_id': LLMProvider.AZURE_OPEN_AI_SERVICE,
                        'detail': extract_error(e.message),
                    }
                )
        except Exception as e:
            print(e)  # TODO MASS
            return False

    def get_language_model(self) -> BaseLanguageModel:
        return AzureChatOpenAI(
            openai_api_key=self.setting.api_key,
            openai_api_version=self.setting.api_version,
            # TODO MASS self.setting.api_base, it dose not work. how to convert URL -> str
            azure_endpoint='https://conversationnel-api-arkea.azure-api.net',
            deployment_name=self.setting.deployment_name,
            model_name=self.setting.model,
            temperature=self.setting.temperature,
        )
