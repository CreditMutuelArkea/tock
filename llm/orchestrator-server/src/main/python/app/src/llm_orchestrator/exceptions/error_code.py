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
from enum import Enum, unique


@unique
class ErrorCode(Enum):
    PROVIDER_NOT_FOUND = 1000
    PROVIDER_BAD_QUERY = 1001

    PROVIDER_API_ERROR = 2000
    PROVIDER_API_CONNECTION_ERROR = 2001
    PROVIDER_API_AUTHENTICATION_ERROR = 2002

    PROVIDER_API_RESOURCE_NOT_FOUND = 2003
    PROVIDER_API_MODEL_NOT_FOUND = 2004
    PROVIDER_API_DEPLOYMENT_NOT_FOUND = 2005

    PROVIDER_API_BAD_REQUEST = 2006
    PROVIDER_API_CONTEXT_LENGTH_EXCEEDED_BAD_REQUEST = 2007


class ErrorMessages:
    MESSAGES = {
        ErrorCode.PROVIDER_NOT_FOUND: {
            'message': 'Unknown AI provider.',
            'details': '',
        },
        ErrorCode.PROVIDER_BAD_QUERY: {
            'message': 'Setting incompatible with the AI provider specified in endpoint.',
            'details': 'Check the provider ID in the setting.',
        },
        ErrorCode.PROVIDER_API_ERROR: {
            'message': 'AI provider API error.',
            'details': '',
        },
        ErrorCode.PROVIDER_API_AUTHENTICATION_ERROR: {
            'message': 'Authentication error to the AI provider API.',
            'details': 'Check your API key or token and make sure it is correct and active.',
        },
        # RESOURCE NOT FOUND
        ErrorCode.PROVIDER_API_RESOURCE_NOT_FOUND: {
            'message': 'An AI provider resource was not found.',
            'details': 'The request URL base is correct, but the path or a query parameter is not.',
        },
        ErrorCode.PROVIDER_API_MODEL_NOT_FOUND: {
            'message': 'Unknown AI provider model.',
            'details': 'Consult the official documentation for accepted values.',
        },
        ErrorCode.PROVIDER_API_DEPLOYMENT_NOT_FOUND: {
            'message': 'Unknown AI provider deployment.',
            'details': 'Consult the official documentation for accepted values.',
        },
        ErrorCode.PROVIDER_API_CONNECTION_ERROR: {
            'message': 'Connection error to the AI provider API.',
            'details': 'Check the requested URL, your network settings, proxy configuration, '
            'SSL certificates, or firewall rules.',
        },
        # BAD REQUEST
        ErrorCode.PROVIDER_API_BAD_REQUEST: {
            'message': 'AI provider API error.',
            'details': 'Bad request.',
        },
        ErrorCode.PROVIDER_API_CONTEXT_LENGTH_EXCEEDED_BAD_REQUEST: {
            'message': "The model's context length has been exceeded.",
            'details': 'Reduce the length of the prompt message.',
        },
    }
