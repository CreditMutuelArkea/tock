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
"""Module for the LangChain Vector Store Factory"""

import logging
from abc import ABC, abstractmethod
from typing import Optional

from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import VectorStore, VectorStoreRetriever
from opensearchpy import OpenSearch
from pydantic import BaseModel, ConfigDict

from gen_ai_orchestrator.errors.handlers.opensearch.opensearch_exception_handler import opensearch_exception_handler
from gen_ai_orchestrator.models.vector_stores.vector_store_setting import BaseVectorStoreSetting
from gen_ai_orchestrator.routers.responses.responses import ProviderSettingStatus, MetadataResponse, MetadataCode
from gen_ai_orchestrator.services.security.security_service import fetch_secret_key_value

logger = logging.getLogger(__name__)


class LangChainVectorStoreFactory(ABC, BaseModel):
    """A base class for LangChain Vector Store Factory"""

    setting: BaseVectorStoreSetting
    embedding_function: Embeddings
    model_config = ConfigDict(arbitrary_types_allowed=True)

    @abstractmethod
    def get_vector_store(self) -> VectorStore:
        """
        Fabric the Vector Store.
        :return: VectorStore the interface for Vector Database.
        """
        pass

    @abstractmethod
    def get_vector_store_retriever(self, search_kwargs: Optional[dict]) -> VectorStoreRetriever:
        """
        Fabric the Vector Store and return it as retriever
        Args:
            search_kwargs: the search filter
        :return: A VectorStoreRetriever.
        """
        pass

    @opensearch_exception_handler
    async def check_vector_store_setting(self) -> ProviderSettingStatus:
        """
        check the vector store setting validity

        Returns:
            True if the setting is valid.

        Raises:
            BusinessException: For incorrect setting
        """
        logger.info('Invoke vector store provider to check setting')
        query = 'what is a vector store ?'

        #  TODO MASS DOCUMENT COUNT
        #  TODO MASS code à mettre dans l'opensearch / a retravailler pour le ticket jira-xxx
        open_search_client = OpenSearch(
            f'https://{self.setting.host}:{self.setting.port}',
            http_auth=(
                self.setting.username,
                fetch_secret_key_value(self.setting.password),
            ),
            use_ssl=False,
            verify_certs=False,
            ssl_assert_hostname=False,
            ssl_show_warn=False,
        )
        nb_documents = open_search_client.count(index=self.setting.index_name)
        logger.debug('[nb_documents: %s]', nb_documents['count'])
        response = await self.get_vector_store().asimilarity_search(
            query=query,
            k=self.setting.k
        )
        logger.info('Invocation successful')
        logger.debug('[query: %s], [response: %s]', query, response)
        return ProviderSettingStatus(valid=True, metadata=[
            MetadataResponse(
                code=MetadataCode.VECTOR_STORE_DOCUMENT_COUNT,
                value=nb_documents['count']
            )
        ])
