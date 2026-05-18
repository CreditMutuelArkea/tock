import logging
from typing import Optional

from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_postgres import PGVector
from pydantic import ConfigDict

logger = logging.getLogger(__name__)


class PGVectorSimilarityRetriever(BaseRetriever):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    vector_store: PGVector
    k: int = 10
    filter: Optional[dict] = None

    def _get_relevant_documents(self, query: str) -> list[Document]:
        logger.info("Query : %s ", query)
        results = self.vector_store.similarity_search_with_score(
            query=query, k=self.k, filter=self.filter
        )
        return self.build_docs(results)

    async def _aget_relevant_documents(self, query: str) -> list[Document]:
        logger.info("Query : %s ", query)
        results = await self.vector_store.asimilarity_search_with_score(
            query=query, k=self.k, filter=self.filter
        )
        return self.build_docs(results)

    def build_docs(self, results) -> list[Document]:
        docs = [Document(page_content=doc.page_content, metadata=doc.metadata | {"vector_score": score})
                for doc, score in results]

        logger.info("--------------")
        logger.info("Retrieved %s documents", len(docs))

        for i, d in enumerate(docs, start=1):
            logger.info(
                "[VEC][Doc %s] id=%s | chunk=%s | score=%.5f | title=%s | source=%s",
                i,
                d.metadata.get("id"),
                d.metadata.get("chunk"),
                d.metadata.get("vector_score", 0.0),
                d.metadata.get("title"),
                d.metadata.get("source"),
            )

        logger.info("--------------")

        return docs
