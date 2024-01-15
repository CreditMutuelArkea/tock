import httpx
from llm_orchestrator.errors.handlers.openai.openai_exception_handler import openai_exception_handler
from openai import APIConnectionError, NotFoundError
from llm_orchestrator.errors.exceptions.exceptions import GenAIConnectionErrorException
from llm_orchestrator.errors.exceptions.ai_provider.ai_provider_exceptions import AIProviderAPIResourceNotFoundException
from llm_orchestrator.errors.handlers.opensearch.opensearch_exception_handler import opensearch_exception_handler
from opensearchpy import ImproperlyConfigured as OpenSearchImproperlyConfigured
from opensearchpy import  NotFoundError as OpenSearchNotFoundError
from llm_orchestrator.errors.exceptions.opensearch.opensearch_exceptions import GenAIOpenSearchResourceNotFoundException, GenAIOpenSearchSettingException


def test_openai_exception_handler_api_connection_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        _request = httpx.Request('GET', 'https://www.dock.tock.ai')
        raise APIConnectionError(message='error', request=_request)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIConnectionErrorException)


def test_openai_exception_handler_not_found_error():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        _request = httpx.Request('GET', 'https://www.dock.tock.ai')
        _response = httpx.Response(request=_request, status_code=400)
        raise NotFoundError(message='error', response=_response, body=None)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, AIProviderAPIResourceNotFoundException)


def test_opensearch_exception_handler_improperly_configured():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchImproperlyConfigured()
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchSettingException)

def test_opensearch_exception_handler_not_found_error():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchNotFoundError('400', 'there was an error')
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchResourceNotFoundException)