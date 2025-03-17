#   Copyright (C) 2023-2024 Credit Mutuel Arkea
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
"""Retrieval-Augmented Generation (RAG) endpoint settings testing tool based
on LangFuse's SDK: runs a specific RAG Settings configuration against a
reference dataset.

Usage:
    run_experiment.py [-v] <experiment_input_file>
    run_experiment.py -h | --help
    run_experiment.py --version

Options:
    -h --help   Show this screen
    --version   Show version
    -v          Verbose output for debugging (without this option, script will
                be silent but for errors)

Build a RAG (Lang)chain from the RAG Query and runs it against the provided
LangFuse dataset. The chain is created anew for each entry of the dataset.
"""
import time
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from docopt import docopt
from gen_ai_orchestrator.routers.requests.requests import RagQuery
from gen_ai_orchestrator.services.langchain.rag_chain import create_rag_chain
from gen_ai_orchestrator.services.security.security_service import fetch_secret_key_value
from langfuse import Langfuse
from langfuse.client import DatasetItemClient

from scripts.common.logging_config import configure_logging
from scripts.evaluation.models import DatasetExperiment, ActivityStatus, StatusWithReason
from scripts.experiment.models import RunExperimentInput, RunExperimentOutput


def construct_chain(rag_query: RagQuery):
    # Modify this if you are testing against a dataset that follows another
    # format
    return {
        'question': lambda x: x['question'],
        'locale': lambda x: x['locale'],
        'no_answer': lambda x: x['no_answer'],
        'chat_history': lambda x: x['chat_history'] if 'chat_history' in x else [],
    } | create_rag_chain(rag_query, vector_db_async_mode=False)



def main():
    start_time = datetime.now()
    cli_args = docopt(__doc__, version='Run Experiment 1.0.0')
    logger = configure_logging(cli_args)

    dataset_experiment = DatasetExperiment()
    dataset_items: List[DatasetItemClient] = []
    tested_items: List[DatasetItemClient] = []
    rag_query: Optional[RagQuery] = None
    try:
        logger.info("Loading input data...")
        experiment_input = RunExperimentInput.from_json_file(cli_args["<experiment_input_file>"])
        logger.debug(f"\n{experiment_input.format()}")


        dataset_experiment = experiment_input.dataset_experiment
        rag_query=experiment_input.rag_query
        client = Langfuse(  # TODO MASS : Refacto
            host=str(rag_query.observability_setting.url),
            public_key=rag_query.observability_setting.public_key,
            secret_key=fetch_secret_key_value(rag_query.observability_setting.secret_key),
        )
        dataset = client.get_dataset(dataset_experiment.dataset_name)
        dataset_items = dataset.items

        for item in dataset_items:
            callback_handlers = []
            handler = item.get_langchain_handler(
                run_name=f'{dataset_experiment}-{str(uuid4())[:8]}',
                run_metadata={
                    'document_index_name': rag_query.document_index_name,
                    'k': rag_query.document_search_params.k,
                },
            )
            callback_handlers.append(handler)
            construct_chain(rag_query).invoke(
                item.input, config={'callbacks': callback_handlers}
            )
            tested_items.append(item)
            if item.id == '7b985562-8d89-43d8-9a1c-d9339f849695':
                break

            print(f'Item:{item.id} - Trace:{handler.get_trace_url()}')
            print(f'Waiting for rate limit delay ({experiment_input.rate_limit_delay}s)...')
            time.sleep(experiment_input.rate_limit_delay)
        client.flush()
        activity_status = StatusWithReason(status=ActivityStatus.COMPLETED)
    except Exception as e:
        full_exception_name = f"{type(e).__module__}.{type(e).__name__}"
        activity_status = StatusWithReason(status=ActivityStatus.FAILED, status_reason=f"{full_exception_name} : {e}")
        logger.error(e, exc_info=True)
    except BaseException as e:
        full_exception_name = f"{type(e).__module__}.{type(e).__name__}"
        activity_status = StatusWithReason(status=ActivityStatus.STOPPED, status_reason=f"{full_exception_name} : {e}")
        logger.error(e, exc_info=True)

    len_dataset_items = len(dataset_items)
    output = RunExperimentOutput(
        status = activity_status,
        rag_query=rag_query,
        dataset_experiment=dataset_experiment,
        duration = datetime.now() - start_time,
        nb_dataset_items=len(dataset_items),
        pass_rate=100 * (len(tested_items) / len_dataset_items) if len_dataset_items > 0 else 0
    )
    logger.debug(f"\n{output.format()}")

if __name__ == '__main__':
    main()

