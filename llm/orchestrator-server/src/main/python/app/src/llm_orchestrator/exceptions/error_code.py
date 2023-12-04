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
    UNKNOWN_PROVIDER = 1001
    UNKNOWN_MODEL = 1002
    UNKNOWN_AZURE_DEPLOYMENT = 1003
    UNKNOWN_AZURE_VERSION = 1004

    CONTEXT_LENGTH_EXCEEDED = 2001

    INVALID_QUERY = 3002

    AUTH_PROVIDER = 4003


class ErrorMessages:
    MESSAGES = {
        ErrorCode.UNKNOWN_PROVIDER: 'Unknown AI provider',
        ErrorCode.UNKNOWN_MODEL: 'Unknown AI model',
        ErrorCode.UNKNOWN_AZURE_DEPLOYMENT: 'Unknown Azure AI deployment',
        ErrorCode.UNKNOWN_AZURE_VERSION: 'Unknown Azure AI Api version',
        ErrorCode.CONTEXT_LENGTH_EXCEEDED: "The model's context length has been exceeded",
        ErrorCode.INVALID_QUERY: 'Setting incompatible with the AI provider specified in endpoint.',
        ErrorCode.AUTH_PROVIDER: 'Authentication failure with the AI provider',
    }
