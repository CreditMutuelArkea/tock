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

from typing import Union

from opensearchpy import (
    AuthenticationException as OpenSearchAuthenticationException,
)
from opensearchpy import ConnectionError as OpenSearchConnectionError
from opensearchpy import ImproperlyConfigured as OpenSearchImproperlyConfigured
from opensearchpy import NotFoundError as OpenSearchNotFoundError
from opensearchpy import OpenSearchDslException, OpenSearchException
from opensearchpy import TransportError as OpenSearchTransportError

from llm_orchestrator.configurations.logging.logger import application_logger
from llm_orchestrator.errors.exceptions.exceptions import (
    GenAIAuthenticationException,
    GenAIConnectionErrorException,
)
from llm_orchestrator.errors.exceptions.opensearch.opensearch_exceptions import (
    GenAIOpenSearchIndexNotFoundException,
    GenAIOpenSearchResourceNotFoundException,
    GenAIOpenSearchSettingException,
    GenAIOpenSearchTransportException,
)
from llm_orchestrator.models.errors.errors_models import ErrorInfo


def opensearch_exception_handler(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except OpenSearchImproperlyConfigured as exc:
            application_logger.error(exc)
            raise GenAIOpenSearchSettingException(create_error_info_opensearch(exc))
        except OpenSearchConnectionError as exc:
            application_logger.error(exc)
            raise GenAIConnectionErrorException(create_error_info_opensearch(exc))
        except OpenSearchAuthenticationException as exc:
            application_logger.error(exc)
            raise GenAIAuthenticationException(create_error_info_opensearch(exc))
        except OpenSearchNotFoundError as exc:
            application_logger.error(exc)
            if 'index_not_found_exception' == exc.error:
                raise GenAIOpenSearchIndexNotFoundException(
                    create_error_info_opensearch(exc)
                )
            else:
                raise GenAIOpenSearchResourceNotFoundException(
                    create_error_info_opensearch(exc)
                )
        except OpenSearchTransportError as exc:
            application_logger.error(exc)
            raise GenAIOpenSearchTransportException(create_error_info_opensearch(exc))

    return wrapper


def create_error_info_opensearch(
    exc: Union[
        OpenSearchImproperlyConfigured, OpenSearchException, OpenSearchDslException
    ],
    provider: str = 'OpenSearch',
) -> ErrorInfo:
    return ErrorInfo(
        provider=provider,
        error=exc.__class__.__name__,
        cause=str(exc),
    )
