import logging

from jinja2 import Template, TemplateError

from gen_ai_orchestrator.errors.exceptions.exceptions import (
    GenAIPromptTemplateException,
)
from gen_ai_orchestrator.models.errors.errors_models import ErrorInfo
from gen_ai_orchestrator.models.prompt.prompt_formatter import PromptFormatter
from gen_ai_orchestrator.models.prompt.prompt_template import PromptTemplate

logger = logging.getLogger(__name__)

def validate_prompt_template(prompt: PromptTemplate, name: str):
    """
    Prompt template validation

    Args:
        prompt: The prompt template
        name: The prompt name

    Returns:
        Nothing.
    Raises:
        GenAIPromptTemplateException: if template is incorrect
    """
    if PromptFormatter.JINJA2 == prompt.formatter:
        try:
            Template(prompt.template).render(prompt.inputs)
        except TemplateError as exc:
            logger.error(f'Validation of the prompt Template has failed! ({name})')
            logger.error(exc)
            raise GenAIPromptTemplateException(
                ErrorInfo(
                    error=exc.__class__.__name__,
                    cause=str(exc),
                )
            )
