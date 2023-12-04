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
        self.message = ErrorMessages.MESSAGES.get(error_code, 'Unknown error')
        self.parameters = parameters


class UnknownProviderException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.UNKNOWN_PROVIDER, parameters)


class InvalidQueryException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.INVALID_QUERY, parameters)


class AuthenticationProviderException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.AUTH_PROVIDER, parameters)


class UnknownModelException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.UNKNOWN_MODEL, parameters)


class UnknownAzureDeploymentException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.UNKNOWN_AZURE_DEPLOYMENT, parameters)


class UnknownAzureVersionException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.UNKNOWN_AZURE_VERSION, parameters)


class ContextLengthExceededException(BusinessException):
    def __init__(self, parameters: dict):
        super().__init__(ErrorCode.CONTEXT_LENGTH_EXCEEDED, parameters)
