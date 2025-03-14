"""
Run an evaluation on LangFuse dataset experiment.
Usage:
        run_chunk_contextualization.py [-v] <chunk_contextualization_input_file>
        run_chunk_contextualization.py -h | --help
        run_chunk_contextualization.py --version

Options:
    -v          Verbose output
    -h --help   Show this screen
    --version   Show version
"""
from datetime import datetime
from typing import List

from docopt import docopt
from gen_ai_orchestrator.services.langchain.factories.langchain_factory import get_llm_factory
from gen_ai_orchestrator.services.security.security_service import fetch_secret_key_value
from langchain_core.output_parsers import StrOutputParser
from langfuse import Langfuse

from scripts.common.logging_config import configure_logging
from scripts.evaluation.models import ActivityStatus, StatusWithReason
from scripts.normalization.models import RunChunkContextualizationInput, RunChunkContextualizationOutput


def main():
    start_time = datetime.now()
    cli_args = docopt(__doc__, version='Run Chunk Contextualization 1.0.0')
    logger = configure_logging(cli_args)

    chunks: List[str] = []
    tested_chunks: List[str] = []
    try:
        logger.info("Loading input data...")
        chunk_contextualization_input = RunChunkContextualizationInput.from_json_file(cli_args["<chunk_contextualization_input_file>"])
        logger.debug(f"\n{chunk_contextualization_input.format()}")

        client = Langfuse(
            host=str(chunk_contextualization_input.observability_setting.url),
            public_key=chunk_contextualization_input.observability_setting.public_key,
            secret_key=fetch_secret_key_value(chunk_contextualization_input.observability_setting.secret_key),
        )

        chunks = chunk_contextualization_input.chunks

        from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate

        # Define the prompt for generating contextual information
        anthropic_contextual_retrieval_system_prompt = """<document>
        {WHOLE_DOCUMENT}
        </document>

        The following are key extracted chunks from the document:
        <chunks>
        {CHUNKS}
        </chunks>

        From the document content, determine the name of the financial product it describes. 

        Then, for each chunk, generate a succinct yet comprehensive context that allows for better search retrieval. The context must:
        - Clearly indicate the financial product it belongs to.
        - Include all relevant details needed to understand the chunk.
        - Resolve any references (e.g., dates, terms, or entities) so they are explicit.
        - Maintain clarity and conciseness while preserving critical information.
        - Please provide context in the language of the original document. If the document is in French, answer in French. If the document is in English, answer in English. Please follow these instructions for all chunks.
        - Uses the correct chunk Id when generating the json response

        Respond only in the following JSON format, and make sure you use the same chunk Id as the one you received as input:

        ```json
        {{
            \"product_name\": \"DETECTED_PRODUCT_NAME\",
            \"contexts\": [
                {{\"id\": \"1\", \"context\": \"Generated context for chunk 1\"}},
                {{\"id\": \"2\", \"context\": \"Generated context for chunk 2\"}}
            ]
        }}
        """

        # Create a PromptTemplate for WHOLE_DOCUMENT and CHUNK_CONTENT
        anthropic_prompt_template = PromptTemplate(
            input_variables=['WHOLE_DOCUMENT', 'CHUNKS'],
            template=anthropic_contextual_retrieval_system_prompt
        )

        # Wrap the prompt in a HumanMessagePromptTemplate
        human_message_prompt = HumanMessagePromptTemplate(prompt=anthropic_prompt_template)
        # Create the final ChatPromptTemplate
        anthropic_contextual_retrieval_final_prompt = ChatPromptTemplate(
            input_variables=['WHOLE_DOCUMENT', 'CHUNKS'],
            messages=[human_message_prompt]
        )
        import os
        from langchain_openai import ChatOpenAI

        # Initialize the model instance
        llm_model_instance = ChatOpenAI(
            model="o1-mini",
        )

        # llm_factory = get_llm_factory(setting=chunk_contextualization_input.llm_setting)
        # Chain the prompt with the model instance
        contextual_chunk_creation = anthropic_contextual_retrieval_final_prompt | llm_model_instance | StrOutputParser()

        # Process each chunk and generate contextual information
        # for test_chunk in chunks:
        formatted_chunks = "\n".join(
            [f"<chunk id='{chunk.id}'>\n{chunk.content}\n</chunk>" for chunk in chunks]
        )
        res = contextual_chunk_creation.invoke({
            "WHOLE_DOCUMENT": chunk_contextualization_input.document.content,
            "CHUNKS": formatted_chunks
        })
        logger.info(f"Result = {res}")
        logger.info('--------------------')
        tested_chunks.append("")


        activity_status = StatusWithReason(status=ActivityStatus.COMPLETED)
    except Exception as e:
        full_exception_name = f"{type(e).__module__}.{type(e).__name__}"
        activity_status = StatusWithReason(status=ActivityStatus.FAILED, status_reason=f"{full_exception_name} : {e}")
        logger.error(e, exc_info=True)
    except BaseException as e: # TODO MASS
        full_exception_name = f"{type(e).__module__}.{type(e).__name__}"
        activity_status = StatusWithReason(status=ActivityStatus.STOPPED, status_reason=f"{full_exception_name} : {e}")
        logger.error(e, exc_info=True)

    len_chunks = len(chunks)
    output = RunChunkContextualizationOutput(
        status = activity_status,
        duration = datetime.now() - start_time,
        nb_chunks=len_chunks,
        pass_rate=100 * (len(tested_chunks) / len_chunks) if len_chunks > 0 else 0
    )
    logger.debug(f"\n{output.format()}")

if __name__ == '__main__':
    main()
