#   Copyright (C) 2023-2024 Credit Mutuel Arkea
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
"""Model for creating Langfuse Callback Handler Factory"""

import logging

from langfuse.api.core import ApiError
from langfuse.callback import CallbackHandler as LangfuseCallbackHandler

from gen_ai_orchestrator.errors.exceptions.observability.observability_exceptions import \
    GenAIObservabilityErrorException
from gen_ai_orchestrator.errors.handlers.langfuse.langfuse_exception_handler import create_error_info_langfuse
from gen_ai_orchestrator.models.observability.observability_type import ObservabilitySetting
from gen_ai_orchestrator.services.langchain.factories.callback_handlers.callback_handlers_factory import \
    LangChainCallbackHandlerFactory
from gen_ai_orchestrator.services.security.security_service import fetch_secret_key_value

logger = logging.getLogger(__name__)


class LangfuseCallbackHandlerFactory(LangChainCallbackHandlerFactory):
    """A class for Langfuse Callback Handler Factory"""

    setting: ObservabilitySetting

    def get_callback_handler(self) -> LangfuseCallbackHandler:
        return LangfuseCallbackHandler(
            host=str(self.setting.url),
            public_key=self.setting.public_key,
            secret_key=fetch_secret_key_value(self.setting.secret_key),
        )

    def check_setting(self) -> bool:
        """Check if the provided credentials (public and secret key) are valid"""
        try:
            self.get_callback_handler().auth_check()
        except ApiError as exc:
            logger.error(exc)
            raise GenAIObservabilityErrorException(
                create_error_info_langfuse(exc)
            )
        return True
