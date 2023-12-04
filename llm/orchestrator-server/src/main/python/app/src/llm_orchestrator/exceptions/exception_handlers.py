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
from fastapi import status
from fastapi.responses import JSONResponse

from llm_orchestrator.exceptions.business_exception import BusinessException


def functional_exception_handler(_, exc: BusinessException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            'code': exc.error_code.value,
            'message': exc.message,
            'parameters': exc.parameters,
        },
    )
