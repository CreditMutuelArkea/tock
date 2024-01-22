
from unittest.mock import patch
from llm_orchestrator.errors.exceptions.exceptions import GenAIUnknownProviderSettingException, VectorStoreUnknownException

from llm_orchestrator.services.langchain.factories.langchain_factory import get_em_factory, get_llm_factory, get_vector_store_factory


def test_get_llm_factory():
    try:
        get_llm_factory(setting='settings with incorrect type')
    except Exception as e:
        assert isinstance(e, GenAIUnknownProviderSettingException)

def test_get_em_factory():
    try:
        get_em_factory(setting='settings with incorrect type')
    except Exception as e:
        assert isinstance(e, GenAIUnknownProviderSettingException)

def test_get_vector_store_factory():
    try:
        get_vector_store_factory(vector_store_provider='an incorrect vector store provider', embedding_function=None, index_name='an index name')
    except Exception as e:
        assert isinstance(e, VectorStoreUnknownException)