import httpx
from llm_orchestrator.errors.handlers.openai.openai_exception_handler import openai_exception_handler
from openai import (
    APIConnectionError,
    AuthenticationError,
    NotFoundError,
    BadRequestError,
    APIError
)
from llm_orchestrator.errors.exceptions.ai_provider.ai_provider_exceptions import (
    AIProviderAPIBadRequestException,
    AIProviderAPIContextLengthExceededException,
    AIProviderAPIDeploymentNotFoundException,
    AIProviderAPIErrorException,
    AIProviderAPIModelException,
    AIProviderAPIResourceNotFoundException
)
from llm_orchestrator.errors.handlers.opensearch.opensearch_exception_handler import opensearch_exception_handler
from opensearchpy import (
    ImproperlyConfigured as OpenSearchImproperlyConfigured,
    ConnectionError as OpenSearchConnectionError,
    AuthenticationException as OpenSearchAuthenticationException,
    NotFoundError as OpenSearchNotFoundError,
    TransportError as OpenSearchTransportError
)
from llm_orchestrator.errors.exceptions.exceptions import (
    GenAIConnectionErrorException,
    GenAIAuthenticationException
)
from llm_orchestrator.errors.exceptions.opensearch.opensearch_exceptions import (
    GenAIOpenSearchSettingException,
    GenAIOpenSearchResourceNotFoundException,
    GenAIOpenSearchIndexNotFoundException,
    GenAIOpenSearchTransportException
)

_request = httpx.Request('GET', 'https://www.dock.tock.ai')
_response = httpx.Response(request=_request, status_code=400)

def test_openai_exception_handler_api_connection_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise APIConnectionError(message='error', request=_request)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIConnectionErrorException)

def test_openai_exception_handler_authentication_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise AuthenticationError(message='error', response=_response, body=None)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIAuthenticationException)


def test_openai_exception_handler_model_not_found_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise NotFoundError(message='error', response=_response, body={'code': 'model_not_found'})
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIModelException)


def test_openai_exception_handler_model_not_found_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise NotFoundError(message='error', response=_response, body=None)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIResourceNotFoundException)

def test_openai_exception_handler_deployment_not_found_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise NotFoundError(message='error', response=_response, body={'code': 'DeploymentNotFound'})
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIDeploymentNotFoundException)

def test_openai_exception_handler_bad_request_context_len_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise BadRequestError(message='error', response=_response, body={'code': 'context_length_exceeded'})
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIContextLengthExceededException)

def test_openai_exception_handler_bad_request_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise BadRequestError(message='error', response=_response, body=None)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIBadRequestException)

def test_openai_exception_handler_api_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        raise APIError(message='error', request=_request, body=None)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIErrorException)


def test_opensearch_exception_handler_improperly_configured():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchImproperlyConfigured()
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchSettingException)

def test_opensearch_exception_handler_connexion_error():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchConnectionError('status_code', 'there was an error', 'some info')
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIAuthenticationException)

def test_opensearch_exception_handler_connexion_error():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchAuthenticationException('status_code', 'there was an error', 'some info')
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIAuthenticationException)

def test_opensearch_exception_handler_resource_not_found_error():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchNotFoundError('400', 'there was an error')
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchResourceNotFoundException)

def test_opensearch_exception_handler_index_not_found_error():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchNotFoundError('400', 'index_not_found_exception')
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchIndexNotFoundException)

def test_opensearch_exception_handler_transport_error():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchTransportError('400', 'there was an error')
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchTransportException)