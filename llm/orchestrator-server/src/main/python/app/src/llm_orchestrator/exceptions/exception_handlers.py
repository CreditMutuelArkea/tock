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
import re

from fastapi import status
from fastapi.responses import JSONResponse
from openai import APIError

from llm_orchestrator.exceptions.business_exception import BusinessException


def business_exception_handler(_, exc: BusinessException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            'code': exc.error_code.value,
            'message': exc.message,
            'details': exc.details,
            'parameters': exc.parameters,
        },
    )


def create_exception_parameters(e: APIError, provider: str):
    return {
        'provider': provider,
        'error': e.__class__.__name__,
        'cause': e.message,
        'request': f'{e.request.method} {e.request.url}',
    }


def extract_error(message: str):
    match = re.search(r'\{.*\}', message)
    if match:
        return match.group()
    else:
        return message
