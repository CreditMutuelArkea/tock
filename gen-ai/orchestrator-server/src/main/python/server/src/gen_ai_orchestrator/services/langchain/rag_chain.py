import asyncio
import json
import logging
import time
from operator import itemgetter
from typing import List, Optional

from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.prompts import PromptTemplate as LangChainPromptTemplate
from langchain_core.retrievers import BaseRetriever
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
    RunnableSerializable,
)
from langchain_core.runnables.config import RunnableConfig
from langchain_core.vectorstores import VectorStoreRetriever
from typing_extensions import Any

from gen_ai_orchestrator.errors.exceptions.exceptions import (
    GenAIGuardCheckException,
)
from gen_ai_orchestrator.errors.handlers.openai.openai_exception_handler import (
    openai_exception_handler,
)
from gen_ai_orchestrator.errors.handlers.opensearch.opensearch_exception_handler import (
    opensearch_exception_handler,
)
from gen_ai_orchestrator.models.document_compressor.document_compressor_setting import (
    BaseDocumentCompressorSetting,
)
from gen_ai_orchestrator.models.errors.errors_models import ErrorInfo
from gen_ai_orchestrator.models.observability.observability_trace import (
    ObservabilityTrace,
)
from gen_ai_orchestrator.models.prompt.prompt_formatter import PromptFormatter
from gen_ai_orchestrator.models.prompt.prompt_template import PromptTemplate
from gen_ai_orchestrator.models.rag.rag_models import (
    ChatMessageType,
    Footnote,
    LLMAnswer,
    RAGDebugData,
    RAGDocument,
    RAGDocumentMetadata, LLMCondensedQuestion,
)
from gen_ai_orchestrator.routers.requests.requests import RAGRequest
from gen_ai_orchestrator.routers.responses.responses import RAGResponse
from gen_ai_orchestrator.services.langchain.callbacks.rag_callback_handler import (
    RAGCallbackHandler,
)
from gen_ai_orchestrator.services.langchain.factories.langchain_factory import (
    create_observability_callback_handler,
    get_compressor_factory,
    get_em_factory,
    get_guardrail_factory,
    get_llm_factory,
    get_vector_store_factory,
)
from gen_ai_orchestrator.services.observability.observabilty_service import (
    get_observability_info,
)
from gen_ai_orchestrator.services.utils.prompt_utility import (
    validate_prompt_template,
)

logger = logging.getLogger(__name__)


async def retrieve_documents_with_variants(
        retriever: BaseRetriever, variants: List[str]
) -> List[Document]:
    """Retrieve documents asynchronously for each variant and deduplicate by id."""
    docs = []
    for variant in variants:
        docs.extend(await retriever.ainvoke(variant))

    unique_docs = {
        (d.metadata.get('id'), d.metadata.get('chunk')): d
        for d in docs
    }

    return list(unique_docs.values())


@opensearch_exception_handler
@openai_exception_handler(provider='OpenAI or AzureOpenAIService')
async def execute_rag_chain(
        request: RAGRequest,
        debug: bool,
        custom_observability_handler: Optional[BaseCallbackHandler] = None,
) -> RAGResponse:

    logger.info('RAG chain - Start of execution...')
    start_time = time.time()

    conversational_retrieval_chain = create_rag_chain(request=request)

    message_history = ChatMessageHistory()
    session_id = None
    user_id = None
    tags = []

    if request.dialog:
        for msg in request.dialog.history:
            if ChatMessageType.HUMAN == msg.type:
                message_history.add_user_message(msg.text)
            else:
                message_history.add_ai_message(msg.text)
        session_id = request.dialog.dialog_id
        user_id = request.dialog.user_id
        tags = request.dialog.tags or []

    inputs = {
        **request.question_answering_prompt.inputs,
        'chat_history': message_history.messages,
    }

    callback_handlers = []
    records_callback_handler = RAGCallbackHandler()
    observability_handler = None
    if debug:
        # Debug callback handler
        callback_handlers.append(records_callback_handler)
    if custom_observability_handler is not None:
        callback_handlers.append(custom_observability_handler)
    if request.observability_setting is not None:
        # Langfuse callback handler
        observability_handler = create_observability_callback_handler(
            observability_setting=request.observability_setting,
        )
        callback_handlers.append(observability_handler)

    metadata = {}
    if user_id is not None:
        metadata['langfuse_user_id'] = user_id
    if session_id is not None:
        metadata['langfuse_session_id'] = session_id
    if tags:
        metadata['langfuse_tags'] = tags

    response = await conversational_retrieval_chain.ainvoke(
        input=inputs,
        config=RunnableConfig(
            callbacks=callback_handlers,
            metadata=metadata,
        ),
    )
    llm_answer = LLMAnswer(**response['answer'])

    # Guardrail
    if request.guardrail_setting:
        guardrail = get_guardrail_factory(
            setting=request.guardrail_setting
        ).get_parser()
        guardrail_output = guardrail.parse(llm_answer.answer)
        check_guardrail_output(guardrail_output)

    # Calculation of RAG processing time
    rag_duration = '{:.2f}'.format(time.time() - start_time)
    logger.info('RAG chain - End of execution. (Duration : %s seconds)', rag_duration)

    # Group contexts by chunk id
    contexts_by_chunk = {
        ctx.chunk: ctx
        for ctx in (llm_answer.context_usage or [])
        if ctx.used_in_response
    }

    # Returning RAG response
    return RAGResponse(
        answer=llm_answer,
        footnotes={
            Footnote(
                identifier=doc.metadata['id'],
                title=doc.metadata['title'],
                url=doc.metadata['source'],
                content=get_source_content(doc),
                score=doc.metadata.get('retriever_score', None),
                metadata=doc.metadata.copy(),
            )
            for doc in response['documents']
            if doc.metadata['id'] in contexts_by_chunk
        },
        observability_info=get_observability_info(
            observability_handler,
            ObservabilityTrace.RAG.value,
        ),
        debug=get_rag_debug_data(request, records_callback_handler, rag_duration)
        if debug
        else None,
    )


def get_source_content(doc: Document) -> str:
    title_prefix = f"{doc.metadata['title']}\n\n"
    if doc.page_content.startswith(title_prefix):
        return doc.page_content[len(title_prefix):]
    else:
        return doc.page_content


def create_rag_chain(
        request: RAGRequest, vector_db_async_mode: Optional[bool] = True
) -> RunnableSerializable[Any, dict[str, Any]]:

    validate_prompt_template(
        request.question_condensing_prompt, 'Question condensing prompt'
    )
    question_condensing_llm_factory = get_llm_factory(
        setting=request.question_condensing_llm_setting
    )

    validate_prompt_template(
        request.question_answering_prompt, 'Question answering prompt'
    )
    question_answering_llm_factory = get_llm_factory(
        setting=request.question_answering_llm_setting
    )

    em_factory = get_em_factory(setting=request.embedding_question_em_setting)

    vector_store_factory = get_vector_store_factory(
        setting=request.vector_store_setting,
        index_name=request.document_index_name,
        embedding_function=em_factory.get_embedding_model(),
    )

    vector_retriever = vector_store_factory.get_similarity_search_with_score_retriever(
        search_kwargs=request.document_search_params.to_dict(),
        async_mode=vector_db_async_mode
    )

    fts_retriever = vector_store_factory.get_text_store_retriever(
        search_kwargs=request.document_search_params.to_dict(),
        async_mode=vector_db_async_mode
    )

    question_condensing_llm = question_condensing_llm_factory.get_language_model()
    question_answering_llm = question_answering_llm_factory.get_language_model()

    chat_chain = build_question_condensation_chain(
        question_condensing_llm, request.question_condensing_prompt
    )

    rag_prompt = LangChainPromptTemplate.from_template(
        template=request.question_answering_prompt.template,
        template_format=request.question_answering_prompt.formatter.value,
        partial_variables=request.question_answering_prompt.inputs,
    )

    async def multi_query_retrieve(inputs) -> list[Document]:
        docs_vector, docs_sql = await asyncio.gather(
            vector_retriever.ainvoke(input=inputs["chat_chain_result"]["condensed_question"]),
            fts_retriever.ainvoke(input=fts_retriever.prepare_query(inputs["chat_chain_result"]["key_words"])),
        )

        results = [docs_vector, docs_sql]

        return apply_rrf_ranking(results, k=60, top_n=7)


    def apply_rrf_ranking(ranked_results: list[list[Document]], k: int, top_n: int) -> list[Document]:

        scores = {}
        for results in ranked_results:
            for rank, doc in enumerate(results, start=1):  # 1-based rank
                doc_id =(doc.metadata.get('id'),doc.metadata.get('chunk'))
                score = 1.0 / (k + rank)
                scores[doc_id] = scores.get(doc_id, 0) + score

        # Sort by RRF score
        unique_docs = {}
        for results in ranked_results:
            for doc in results:
                unique_docs[(doc.metadata.get('id'),doc.metadata.get('chunk'))] = doc

        ranked_docs = sorted(unique_docs.values(), key=lambda doc: scores[(doc.metadata.get('id'),doc.metadata.get('chunk'))], reverse=True)

        # Storing RRF score
        for doc in ranked_docs:
            doc.metadata["rrf_score"] = scores[(doc.metadata.get('id'),doc.metadata.get('chunk'))]

        logger.info("--------------")
        logger.info("RRF %d docs", len(ranked_docs))

        for i, d in enumerate(ranked_docs, start=1):
            logger.info(
                "[RRF][Doc %s] id=%s | chunk=%s | tscore=%5f | v_score=%.5f | rrf_score=%.5f | title=%s | source=%s",
                i,
                d.metadata.get("id"),
                d.metadata.get("chunk"),
                d.metadata.get("text_score", 0.0),
                d.metadata.get("vector_score", 0.0),
                d.metadata.get("rrf_score", 0.0),
                d.metadata.get("title"),
                d.metadata.get("source"),
            )

        logger.info("--------------")


        # Return only the top N docs back.
        return ranked_docs[:top_n]

    with_condensed_question = RunnableParallel(
        {
            'chat_chain_result': chat_chain,
            'question': itemgetter('question'),
            'chat_history': itemgetter('chat_history'),
        }
    )

    rag_inputs = with_condensed_question | RunnableParallel(
        {
            'question': lambda x: x["chat_chain_result"]['condensed_question'],
            'key_words': lambda x: x["chat_chain_result"]['key_words'],
            'chat_history': itemgetter('chat_history'),
            'documents': RunnableLambda(name="multi_query_retrieve", func=multi_query_retrieve),
        }
    )

    return rag_inputs | RunnablePassthrough.assign(
        answer=(
                {
                    'context': lambda x: json.dumps(
                        [
                            {
                                'chunk_id': doc.metadata['id'],
                                'title': doc.metadata['title'],
                                'url': doc.metadata['source'],
                                'chunk_text': doc.page_content,
                            }
                            for doc in x['documents']
                        ],
                        ensure_ascii=False,
                        indent=2,
                    ),
                    'chat_history': format_chat_history,
                }
                | rag_prompt
                | question_answering_llm
                | JsonOutputParser(pydantic_object=LLMAnswer, name='rag_chain_output')
        )
    )


def format_chat_history(x):
    messages = []
    for msg in x['chat_history']:
        if isinstance(msg, HumanMessage):
            messages.append({'user': msg.content})
        elif isinstance(msg, AIMessage):
            messages.append({'assistant': msg.content})
    return json.dumps(messages, ensure_ascii=False, indent=2)


def build_question_condensation_chain(
        llm, prompt: PromptTemplate
) -> ChatPromptTemplate:
    return (
            ChatPromptTemplate.from_messages(
                [
                    ('system', prompt.template),
                    MessagesPlaceholder(variable_name='chat_history'),
                    ('human', '{{ question }}' if prompt.formatter == PromptFormatter.JINJA2 else '{question}'),
                ]
                ,template_format=prompt.formatter.value
            ).partial(**prompt.inputs)
            | llm
            | JsonOutputParser(pydantic_object=LLMCondensedQuestion, name='rag_question_condensation_chain_output')
    )


def rag_log(level, message, question, answer, response):
    logger.log(
        level,
        '%(message)s \n'
        'RAG chain - question="%(question)s", answer="%(answer)s", documents="%(documents)s"',
        {
            'message': message,
            'question': question,
            'answer': answer,
            'documents': len(response['documents']),
        },
    )

def get_rag_documents(handler: RAGCallbackHandler) -> List[RAGDocument]:
    if handler.records['documents'] is None:
        return []

    return [
        # Get first 100 char of content
        RAGDocument(
            content=doc.page_content[0: len(doc.metadata['title']) + 100] + '...',
            metadata=RAGDocumentMetadata(**doc.metadata),
        )
        for doc in handler.records['documents']
    ]


def get_llm_answer(rag_chain_output) -> LLMAnswer:
    if rag_chain_output is None:
        return LLMAnswer()

    return LLMAnswer(
        **json.loads(
            rag_chain_output.strip().removeprefix('```json').removesuffix('```').strip()
        )
    )

def get_rag_debug_data(
        request: RAGRequest, records_callback_handler: RAGCallbackHandler, rag_duration
) -> RAGDebugData:
    history = []
    if request.dialog:
        history = request.dialog.history

    return RAGDebugData(
        user_question=request.question_answering_prompt.inputs['question'],
        question_condensing_prompt=records_callback_handler.records['chat_prompt'],
        question_condensing_history=history,
        condensed_question="",  # records_callback_handler.records['chat_chain_output'],
        question_answering_prompt=records_callback_handler.records['rag_prompt'],
        documents=get_rag_documents(records_callback_handler),
        document_index_name=request.document_index_name,
        document_search_params=request.document_search_params,
        answer=get_llm_answer(records_callback_handler.records['rag_chain_output']),
        duration=rag_duration,
    )

def check_guardrail_output(guardrail_output: dict) -> bool:
    if guardrail_output['output_toxicity']:
        message = f"Toxicity detected in LLM output ({','.join(guardrail_output['output_toxicity_reason'])})"
        raise GenAIGuardCheckException(ErrorInfo(cause=message))
    return True

