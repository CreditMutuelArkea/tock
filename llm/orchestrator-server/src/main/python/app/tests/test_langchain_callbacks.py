from llm_orchestrator.services.langchain.callbacks.retriever_json_callback_handler import RetrieverJsonCallbackHandler


def test_retriever_json_callback_handler_on_chain_start():
    """Check records are added (in the correct entries)"""
    handler = RetrieverJsonCallbackHandler()
    _inputs={
        'input_documents': [],
        'question' : "What is happening?",
        'chat_history': []
    }
    handler.on_chain_start(serialized={}, inputs=_inputs)
    assert handler.records['on_chain_start_records'][0]['event_name'] == 'on_chain_start'
    assert handler.records['action_records'][0]['event_name'] == 'on_chain_start'

def test_retriever_json_callback_handler_on_chain_end():
    """Check records are added (in the correct entries)"""
    handler = RetrieverJsonCallbackHandler()
    _outputs={
        'text': 'This is what is happening',
    }
    handler.on_chain_end(outputs=_outputs)
    assert handler.records['on_chain_end_records'][0]['event_name'] == 'on_chain_end'
    assert handler.records['action_records'][0]['event_name'] == 'on_chain_end'

def test_retriever_json_callback_handler_on_text():
    """Check records are added (in the correct entries)"""
    handler = RetrieverJsonCallbackHandler()
    handler.on_text(text='Some text arrives')
    assert handler.records['on_text_records'][0]['event_name'] == 'on_text'
    assert handler.records['action_records'][0]['event_name'] == 'on_text'