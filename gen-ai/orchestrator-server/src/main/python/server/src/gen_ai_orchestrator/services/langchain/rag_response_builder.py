"""
RAG Response Builder
--------------------
Responsible for assembling RAGResponse objects from raw chain outputs,
including footnotes, debug data, and observability metadata.
"""

import json
import logging
from typing import List

from langchain_core.documents import Document

from gen_ai_orchestrator.models.rag.rag_models import (
    Footnote,
    LLMAnswer,
    RAGDebugData,
    RAGDocument,
    RAGDocumentMetadata,
)
from gen_ai_orchestrator.routers.requests.requests import RAGRequest
from gen_ai_orchestrator.routers.responses.responses import RAGResponse
from gen_ai_orchestrator.services.langchain.callbacks.rag_callback_handler import (
    RAGCallbackHandler,
)
from gen_ai_orchestrator.services.observability.observabilty_service import (
    get_observability_info,
)
from gen_ai_orchestrator.models.observability.observability_trace import ObservabilityTrace

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Footnote / source helpers
# ---------------------------------------------------------------------------

def get_source_content(doc: Document) -> str:
    """Strip the title prefix that may have been prepended to the chunk text."""
    title_prefix = f"{doc.metadata['title']}\n\n"
    if doc.page_content.startswith(title_prefix):
        return doc.page_content[len(title_prefix):]
    return doc.page_content

def extract_rank(value: str | None) -> int:
    """
    Convert "3/15" -> 3
    Missing value -> very large number
    """
    if not value:
        return 999999

    return int(value.split("/")[0])

def footnote_sort_key(doc: Document) -> tuple[int, int]:
    metadata = doc.metadata

    if "rrf_rank" in metadata:
        return 0, extract_rank(metadata["rrf_rank"])

    if "similarity_rank" in metadata:
        return 1, extract_rank(metadata["similarity_rank"])

    if "fts_rank" in metadata:
        return 2, extract_rank(metadata["fts_rank"])

    return 3, 999999

def build_footnotes(
    documents: list[Document],
    llm_answer: LLMAnswer,
) -> list[Footnote]:
    """
    Return one Footnote per document whose chunk was actually used in the
    LLM answer (according to context_usage).
    """
    used_chunk_ids = {
        ctx.chunk
        for ctx in (llm_answer.context_usage or [])
        if ctx.used_in_response
    }

    used_docs = [
        doc
        for doc in documents
        if doc.metadata["id"] in used_chunk_ids
    ]

    sorted_docs = sorted(
        used_docs,
        key=footnote_sort_key,
    )

    return [
        Footnote(
            identifier=doc.metadata["id"],
            title=doc.metadata["title"],
            url=doc.metadata["source"],
            content=get_source_content(doc),
            metadata=doc.metadata.copy(),
        )
        for doc in sorted_docs
    ]


# ---------------------------------------------------------------------------
# Debug data helpers
# ---------------------------------------------------------------------------

def get_rag_documents(handler: RAGCallbackHandler) -> List[RAGDocument]:
    """Convert raw LangChain documents captured by the callback into RAGDocument objects."""
    if handler.records.get("documents") is None:
        return []

    return [
        RAGDocument(
            content=doc.page_content[: len(doc.metadata["title"]) + 100] + "...",
            metadata=RAGDocumentMetadata(**doc.metadata),
        )
        for doc in handler.records["documents"]
    ]


def get_llm_answer_from_raw(rag_chain_output: str | None) -> LLMAnswer:
    """Parse a raw JSON string (possibly fenced with ```json```) into an LLMAnswer."""
    if rag_chain_output is None:
        return LLMAnswer()

    cleaned = (
        rag_chain_output.strip()
        .removeprefix("```json")
        .removesuffix("```")
        .strip()
    )
    return LLMAnswer(**json.loads(cleaned))


def build_rag_debug_data(
    request: RAGRequest,
    records_callback_handler: RAGCallbackHandler,
    rag_duration: str,
) -> RAGDebugData:
    history = request.dialog.history if request.dialog else []

    return RAGDebugData(
        user_question=request.question_answering_prompt.inputs["question"],
        question_condensing_prompt=records_callback_handler.records.get("chat_prompt"),
        question_condensing_history=history,
        condensed_question="",
        question_answering_prompt=records_callback_handler.records.get("rag_prompt"),
        documents=get_rag_documents(records_callback_handler),
        document_index_name=request.document_index_name,
        document_search_params=request.document_search_params,
        answer=get_llm_answer_from_raw(records_callback_handler.records.get("rag_chain_output")),
        duration=rag_duration,
    )


# ---------------------------------------------------------------------------
# Full response assembler
# ---------------------------------------------------------------------------

def build_rag_response(
    chain_output: dict,
    llm_answer: LLMAnswer,
    request: RAGRequest,
    records_callback_handler: RAGCallbackHandler,
    observability_handler,
    rag_duration: str,
    debug: bool,
) -> RAGResponse:
    """Assemble the final RAGResponse from all intermediate results."""
    return RAGResponse(
        answer=llm_answer,
        footnotes=build_footnotes(chain_output["documents"], llm_answer),
        observability_info=get_observability_info(
            observability_handler,
            ObservabilityTrace.RAG.value,
        ),
        debug=build_rag_debug_data(request, records_callback_handler, rag_duration)
        if debug
        else None,
    )
