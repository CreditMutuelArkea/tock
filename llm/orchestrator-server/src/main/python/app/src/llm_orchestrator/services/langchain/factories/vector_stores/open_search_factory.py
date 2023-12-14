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
from langchain.vectorstores.opensearch_vector_search import (
    OpenSearchVectorSearch,
)

from llm_orchestrator.services.langchain.factories.vector_stores.vector_store_factory import (
    LangChainVectorStoreFactory,
)
from llm_orchestrator.settings import application_settings, is_prod_environment


class OpenSearchFactory(LangChainVectorStoreFactory):
    def get_vector_store(self):
        return OpenSearchVectorSearch(
            opensearch_url=f'https://{application_settings.open_search_host}:{application_settings.open_search_port}',
            http_auth=(
                application_settings.open_search_user,
                application_settings.open_search_pwd,
            ),
            use_ssl=is_prod_environment,
            verify_certs=is_prod_environment,
            ssl_assert_hostname=is_prod_environment,
            ssl_show_warn=is_prod_environment,
            index_name=self.index_name,
            embedding_function=self.embedding_function,
        )
