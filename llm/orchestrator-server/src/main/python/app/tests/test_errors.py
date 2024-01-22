from llm_orchestrator.models.errors.errors_models import ErrorCode

def test_errors_are_documented():
    """Test that a description or error codes is added to the Pydantic schema.  """
    first_error_code = ErrorCode.GEN_AI_UNKNOWN_ERROR
    schema = ErrorCode.__get_pydantic_json_schema__(core_schema=None, handler=None)
    assert f'* `{first_error_code.value}`: {first_error_code.name}' in schema['description']