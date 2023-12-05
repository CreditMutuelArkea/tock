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

import logging

from langchain.base_language import BaseLanguageModel
from langchain.chat_models import AzureChatOpenAI
from openai import (
    APIConnectionError,
    APIError,
    AuthenticationError,
    BadRequestError,
    NotFoundError,
)

from llm_orchestrator.exceptions.business_exception import (
    ProviderAPIAuthenticationException,
    ProviderAPIBadRequestException,
    ProviderAPIConnectionException,
    ProviderAPIContextLengthExceededException,
    ProviderAPIDeploymentException,
    ProviderAPIErrorException,
    ProviderAPIResourceNotFoundException,
)
from llm_orchestrator.exceptions.exception_handlers import (
    create_exception_parameters,
)
from llm_orchestrator.models.llm.azureopenai.azure_openai_llm_setting import (
    AzureOpenAILLMSetting,
)
from llm_orchestrator.services.langchain.factories.llm.llm_factory import (
    LangChainLLMFactory,
)

logger = logging.getLogger(__name__)


class AzureOpenAILLMFactory(LangChainLLMFactory):
    setting: AzureOpenAILLMSetting

    def get_language_model(self) -> BaseLanguageModel:
        return AzureChatOpenAI(
            openai_api_key=self.setting.api_key,
            openai_api_version=self.setting.api_version,
            azure_endpoint=str(self.setting.api_base),
            deployment_name=self.setting.deployment_name,
            model_name=self.setting.model,
            temperature=self.setting.temperature,
        )

    def check_llm_setting(self) -> bool:
        try:
            self.get_language_model().invoke('Hi, are you there?')
            return True
        except APIConnectionError as e:
            logger.error(e)
            raise ProviderAPIConnectionException(
                create_exception_parameters(e, self.setting.provider)
            )
        except AuthenticationError as e:
            logger.error(e)
            raise ProviderAPIAuthenticationException(
                create_exception_parameters(e, self.setting.provider)
            )
        except NotFoundError as e:
            logger.error(e)
            if 'DeploymentNotFound' == e.code:
                raise ProviderAPIDeploymentException(
                    create_exception_parameters(e, self.setting.provider)
                )
            else:
                raise ProviderAPIResourceNotFoundException(
                    create_exception_parameters(e, self.setting.provider)
                )
        except BadRequestError as e:
            logger.error(e)
            if 'context_length_exceeded' == e.code:
                raise ProviderAPIContextLengthExceededException(
                    create_exception_parameters(e, self.setting.provider)
                )
            else:
                raise ProviderAPIBadRequestException(
                    create_exception_parameters(e, self.setting.provider)
                )
        except APIError as e:
            logger.error(e)
            raise ProviderAPIErrorException(
                create_exception_parameters(e, self.setting.provider)
            )
