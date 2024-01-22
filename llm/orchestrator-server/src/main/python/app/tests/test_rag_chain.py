from unittest.mock import patch
from langchain_core.prompts.prompt import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_core.messages import AIMessage
from llm_orchestrator.errors.exceptions.exceptions import GenAIGuardCheckException
from llm_orchestrator.models.rag.rag_models import TextWithFootnotes
from llm_orchestrator.models.vector_stores.vectore_store_provider import VectorStoreProvider
from llm_orchestrator.routers.requests.requests import RagQuery
from llm_orchestrator.services.langchain import rag_chain
from llm_orchestrator.services.langchain.rag_chain import execute_qa_chain

# 'Mock an item where it is used, not where it came from.'
# (https://www.toptal.com/python/an-introduction-to-mocking-in-python)
# See https://docs.python.org/3/library/unittest.mock.html#where-to-patch
# Here:
# --> Not where it came from:
# @patch('llm_orchestrator.services.langchain.factories.langchain_factory.get_llm_factory')
# --> But where it is used (in the execute_qa_chain method of the llm_orchestrator.services.langchain.rag_chain 
# module that imports get_llm_factory):
@patch('llm_orchestrator.services.langchain.rag_chain.get_llm_factory')
@patch('llm_orchestrator.services.langchain.rag_chain.get_em_factory')
@patch('llm_orchestrator.services.langchain.rag_chain.get_vector_store_factory')
@patch('llm_orchestrator.services.langchain.rag_chain.PromptTemplate')
@patch('llm_orchestrator.services.langchain.rag_chain.__find_input_variables')
@patch('llm_orchestrator.services.langchain.rag_chain.ConversationalRetrievalChain.from_llm')
@patch('llm_orchestrator.services.langchain.rag_chain.RetrieverJsonCallbackHandler')
@patch('llm_orchestrator.services.langchain.rag_chain.__rag_guard')
@patch('llm_orchestrator.services.langchain.rag_chain.RagResponse')
@patch('llm_orchestrator.services.langchain.rag_chain.TextWithFootnotes')
def test_rag_chain(
    mocked_text_with_footnotes,
    mocked_rag_response,
    mocked_rag_guard,
    mocked_callback_init,
    mocked_chain_builder,
    mocked_find_input_variables,
    mocked_prompt_template,
    mocked_get_vector_store_factory,
    mocked_get_em_factory,
    mocked_get_llm_factory,
):
    """Test the full execute_qa_chain method by mocking all external calls."""
    # Build a test RagQuery
    query_dict = {
        'history': [
            {'text': 'Hello, how can I do this?',
             'type': 'HUMAN'},
            {
                'text': 'you can do this with the following method ....',
                'type': 'AI',
            },
        ],
        'question_answering_llm_setting': {
            'provider': 'OpenAI',
            'api_key': 'ab7***************************A1IV4B',
            'temperature': 1.2,
            'prompt': """Use the following context to answer the question at the end.
If you don't know the answer, just say {no_answer}.

Context:
{context}

Question:
{question}

Answer in {locale}:""",
            'model': 'gpt-3.5-turbo',
        },
        'question_answering_prompt_inputs': {
            'question': 'How to get started playing guitar ?',
            'no_answer': "Sorry, I don't know.",
            'locale': 'French',
        },
        'embedding_question_em_setting': {
            'provider': 'OpenAI',
            'api_key': 'ab7***************************A1IV4B',
            'model': 'text-embedding-ada-002',
        },
        'document_index_name': 'my-index-name',
        'document_search_params': {
            'provider': 'OpenSearch',
            'filter': [
                {
                    'term': {
                        'metadata.index_session_id.keyword': '352d2466-17c5-4250-ab20-d7c823daf035'
                    }
                }
            ],
            'k': 4,
        },
    }
    query = RagQuery(**query_dict)
    
    # Setup mock factories/init return value
    em_factory_instance = mocked_get_em_factory.return_value
    llm_factory_instance = mocked_get_llm_factory.return_value
    vector_store_factory_instance = mocked_get_vector_store_factory.return_value
    mocked_chain = mocked_chain_builder.return_value
    mocked_callback = mocked_callback_init.return_value
    mocked_rag_answer = mocked_chain.invoke.return_value
    mocked_rag_answer['answer'] = 'an answer from llm'
    
    # Call function
    execute_qa_chain(query, debug=True)
    
    # Assert factories are called with the expected settings from query
    mocked_get_llm_factory.assert_called_once_with(
        setting=query.question_answering_llm_setting
    )
    mocked_get_em_factory.assert_called_once_with(
        setting=query.embedding_question_em_setting
    )
    mocked_get_vector_store_factory.assert_called_once_with(
        vector_store_provider=VectorStoreProvider.OPEN_SEARCH,
        embedding_function=em_factory_instance.get_embedding_model(),
        index_name=query.document_index_name
    )
    # Assert LangChain qa chain is created using the expected settings from query
    mocked_chain_builder.assert_called_once_with(
        llm=llm_factory_instance.get_language_model(),
        retriever=vector_store_factory_instance.get_vector_store().as_retriever(
            search_kwargs=query.document_search_params.to_dict()
        ),
        return_source_documents=True,
        return_generated_question=True,
        combine_docs_chain_kwargs={
            # PromptTemplate must be mocked or searching for params in it will fail
            'prompt': mocked_prompt_template(
                template=query.question_answering_llm_setting.prompt,
                input_variables=['no_answer', 'context', 'question', 'locale']
            )
        }
    )
    # Assert qa chain is invoke()d with the expected settings from query
    mocked_chain.invoke.assert_called_once_with(
        input={
            **query.question_answering_prompt_inputs,
            'chat_history': [
                HumanMessage(content='Hello, how can I do this?'),
                AIMessage(content='you can do this with the following method ....')
            ]
        },
        config={'callbacks': [mocked_callback]},
    )
    # Assert the response is build using the expected settings
    mocked_rag_response.assert_called_once_with(
        # TextWithFootnotes must be mocked or mapping the footnotes will fail
        answer=mocked_text_with_footnotes(
            text = mocked_rag_answer['answer'],
            footnotes = []
        ),
        debug=mocked_callback.show_records()
    )

def test__find_input_variables():
    template = "This is a {sample} text with {multiple} curly brace sections"
    input_vars = rag_chain.__find_input_variables(template)
    assert input_vars == ['sample', 'multiple']

@patch('llm_orchestrator.services.langchain.rag_chain.__rag_log')
def test__rag_guard_fails_if_no_docs_in_valid_answer(mocked_log):
    inputs = {
        'no_answer': "Sorry, I don't know."
    }
    response = {
        'answer': 'a valid answer',
        'source_documents': [],
    }
    try:
        rag_chain.__rag_guard(inputs, response)
    except Exception as e:
        assert isinstance(e, GenAIGuardCheckException)

@patch('llm_orchestrator.services.langchain.rag_chain.__rag_log')
def test__rag_guard_removes_docs_if_no_answer(mocked_log):
    inputs = {
        'no_answer': "Sorry, I don't know."
    }
    response = {
        'answer': "Sorry, I don't know.",
        'source_documents': ['a doc as a string'],
    }
    rag_chain.__rag_guard(inputs, response)
    assert response['source_documents'] == []