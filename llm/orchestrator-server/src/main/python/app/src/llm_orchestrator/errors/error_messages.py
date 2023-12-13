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

from llm_orchestrator.models.errors.errors_models import ErrorCode, ErrorMessage


class ErrorMessages:
    ERROR_MESSAGES = {
        ErrorCode.PROVIDER_NOT_FOUND: ErrorMessage(message='Unknown AI provider.'),
        ErrorCode.PROVIDER_BAD_QUERY: ErrorMessage(
            message='Bad query.', detail='The request seems to be invalid.'
        ),
        ErrorCode.PROVIDER_API_ERROR: ErrorMessage(message='AI provider API error.'),
        ErrorCode.PROVIDER_API_AUTHENTICATION_ERROR: ErrorMessage(
            message='Authentication error to the AI provider API.',
            detail='Check your API key or token and make sure it is correct and active.',
        ),
        # RESOURCE NOT FOUND
        ErrorCode.PROVIDER_API_RESOURCE_NOT_FOUND: ErrorMessage(
            message='An AI provider resource was not found.',
            detail='The request URL base is correct, but the path or a query parameter is not.',
        ),
        ErrorCode.PROVIDER_API_MODEL_NOT_FOUND: ErrorMessage(
            message='Unknown AI provider model.',
            detail='Consult the official documentation for accepted values.',
        ),
        ErrorCode.PROVIDER_API_DEPLOYMENT_NOT_FOUND: ErrorMessage(
            message='Unknown AI provider deployment.',
            detail='Consult the official documentation for accepted values.',
        ),
        ErrorCode.PROVIDER_API_CONNECTION_ERROR: ErrorMessage(
            message='Connection error to the AI provider API.',
            detail='Check the requested URL, your network settings, proxy configuration, '
            'SSL certificates, or firewall rules.',
        ),
        # BAD REQUEST
        ErrorCode.PROVIDER_API_BAD_REQUEST: ErrorMessage(
            message='AI provider API error.', detail='Bad request.'
        ),
        ErrorCode.PROVIDER_API_CONTEXT_LENGTH_EXCEEDED_BAD_REQUEST: ErrorMessage(
            message="The model's context length has been exceeded.",
            detail='Reduce the length of the prompt message.',
        ),
    }

    def get_message(self, code: ErrorCode) -> ErrorMessage:
        return self.ERROR_MESSAGES.get(code, ErrorMessage(message='Unknown error'))
