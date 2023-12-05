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

from llm_orchestrator.exceptions.error_code import ErrorCode, ErrorMessages


class BusinessException(Exception):
    def __init__(self, error_code: ErrorCode, parameters: dict):
        self.error_code = error_code
        unknown_error = {'message': 'Unknown error', 'details': ''}
        self.message = ErrorMessages.MESSAGES.get(error_code, unknown_error)['message']
        self.details = ErrorMessages.MESSAGES.get(error_code, unknown_error)['details']
        self.parameters = parameters


class UnknownProviderException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_NOT_FOUND, parameters)


class InvalidQueryException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_BAD_QUERY, parameters)


class ProviderAPIErrorException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_ERROR, parameters)


class ProviderAPIConnectionException(BusinessException):
    """
    Two cases handled :
    - Connection error. Example: Internet or proxy connectivity / Azure endpoint non existent
    - Request timed out
    """

    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_CONNECTION_ERROR, parameters)


class ProviderAPIAuthenticationException(BusinessException):
    """
    API key or token was invalid, expired, or revoked.
    """

    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_AUTHENTICATION_ERROR, parameters)


class ProviderAPIBadRequestException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_UNKNOWN_BAD_REQUEST, parameters)


class ProviderAPIContextLengthExceededException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(
            ErrorCode.PROVIDER_API_CONTEXT_LENGTH_EXCEEDED_BAD_REQUEST, parameters
        )


class ProviderAPIResourceNotFoundException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_RESOURCE_NOT_FOUND, parameters)


class ProviderAPIModelException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_MODEL_NOT_FOUND, parameters)


class ProviderAPIDeploymentException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.PROVIDER_API_DEPLOYMENT_NOT_FOUND, parameters)
