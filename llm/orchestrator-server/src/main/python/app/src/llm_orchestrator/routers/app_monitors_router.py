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
from fastapi import APIRouter, status
from pydantic import BaseModel

application_check_router = APIRouter(tags=['Application Monitors'])


class Check(BaseModel):
    """Response model to validate and return when performing a specific check."""

    status: str = 'Ok'


@application_check_router.get(
    '/health-check',
    summary='Perform a health check',
    response_description='Return HTTP status code 200 (OK)',
    status_code=status.HTTP_200_OK,
)
def get_health() -> Check:
    """
    ## Perform a Health Check
    Endpoint to perform a health check on. This endpoint can primarily be used Docker
    to ensure a robust container orchestration and management is in place. Other
    services which rely on proper functioning of the API service will not deploy if this
    endpoint returns any other HTTP status code except 200 (OK).
    Returns:
        HealthCheck: Returns a JSON response with the health status
    """
    return Check(status='OK')
    # TODO : Add a check for OpenSearch
    # https://docs.aws.amazon.com/opensearch-service/latest/developerguide/supported-operations.html


@application_check_router.get(
    '/liveness-check',
    summary='Perform a liveness check',
    response_description='Return HTTP status code 200 (OK)',
    status_code=status.HTTP_200_OK,
)
def get_health() -> Check:
    """
    ## Perform a Liveness Check
    Endpoint to perform a liveness check on. This endpoint can primarily be used Docker
    to ensure a robust container orchestration and management is in place. Other
    services which rely on proper functioning of the API service will not deploy if this
    endpoint returns any other HTTP status code except 200 (OK).
    Returns:
        LivenessCheck: Returns a JSON response with the liveness status
    """
    return Check(status='OK')
