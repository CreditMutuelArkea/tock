import httpx
from llm_orchestrator.errors.handlers.openai.openai_exception_handler import openai_exception_handler
from openai import APIConnectionError
from llm_orchestrator.errors.exceptions.exceptions import GenAIConnectionErrorException
from llm_orchestrator.errors.handlers.opensearch.opensearch_exception_handler import opensearch_exception_handler
from opensearchpy import ImproperlyConfigured as OpenSearchImproperlyConfigured
from llm_orchestrator.errors.exceptions.opensearch.opensearch_exceptions import GenAIOpenSearchSettingException


def test_openai_exception_handler():

    @openai_exception_handler(provider='OpenAI or AzureOpenAIService')
    def decorated_function(*args, **kwargs):
        _request = httpx.Request('GET', 'https://www.dock.tock.ai')
        raise APIConnectionError(message='error', request=_request)
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIConnectionErrorException)

def test_opensearch_exception_handler():

    @opensearch_exception_handler
    def decorated_function(*args, **kwargs):
        raise OpenSearchImproperlyConfigured
    
    try:
        decorated_function()
    except Exception as e:
        assert isinstance(e, GenAIOpenSearchSettingException)