from unittest.mock import patch
from llm_orchestrator.routers.requests.requests import RagQuery
from llm_orchestrator.services.langchain.rag_chain import execute_qa_chain

# 'Mock an item where it is used, not where it came from.'
# (https://www.toptal.com/python/an-introduction-to-mocking-in-python)
# See https://docs.python.org/3/library/unittest.mock.html#where-to-patch
# Here:
# --> Not where it came from:
# @patch('llm_orchestrator.services.langchain.factories.langchain_factory.get_llm_factory')
# --> But where it is used (in the execute_qa_chain method in the llm_orchestrator.services.langchain.rag_chain 
# module that imports get_llm_factory):
@patch('llm_orchestrator.services.langchain.rag_chain.get_llm_factory')
@patch('llm_orchestrator.services.langchain.rag_chain.get_em_factory')
@patch('llm_orchestrator.services.langchain.rag_chain.get_vector_store_factory')
# @patch('llm_orchestrator.services.langchain.rag_chain.ConversationalRetrievalChain.from_llm')
# @patch('llm_orchestrator.services.langchain.rag_chain.RetrieverJsonCallbackHandler')
def test_rag_chain(
    # mock_callback,
    # mock_chain,
    mock_vector_store_factory,
    mock_em_factory,
    mock_llm_factory,
):
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
            'no_answer': 'Sorry, I don' 't know.',
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
    mock_llm_factory.return_value = 'fish'
    mock_em_factory.return_value = 'cat'
    mock_em_factory.method.get_embedding_model.return_value = 'something'
    mock_vector_store_factory.return_value = 'fox'
    # mock_chain.return_value = 'dog'
    # mock_callback.return_value = 'owl'
    query = RagQuery(**query_dict)
    execute_qa_chain(query, debug=False)
    mock_llm_factory.assert_called_once()