"""
Export a LangFuse dataset run results.
Usage:
        export_experiments.py [-v] <dataset_name> <experiment_name> <rag_query> <metrics_json_file>
        export_experiments.py -h | --help
        export_experiments.py --version

Arguments:
    dataset_name        the dataset name
    experiment_name     the experiment name

Options:
    -v          Verbose output
    -h --help   Show this screen
    --version   Show version


The exported CSV file will have these columns :
'Reference input'|'Reference output'|'Response 1'|'Sources 1'|...|'Response N'|'Sources N'
The CSV file will be saved in the same location as the script.
NB: There will be as many responses as run sessions

Note that you need to set the LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY environment variables in order to use Langfuse.
The LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY are the secret and public keys provided by Langfuse

"""

import json
import logging
import os
import sys
import time
from typing import Optional

from docopt import docopt
from dotenv import load_dotenv
from gen_ai_orchestrator.routers.requests.requests import RagQuery
from langfuse.api import TraceWithFullDetails

from generate_dataset import init_langfuse
from scripts.evaluation.ragas_evaluator import RagasEvaluator


# LangFuse-specific functions
def fetch_trace_by_item_and_dataset_run(_dataset_run, _item) -> Optional[TraceWithFullDetails]:
    """
    Fetches the trace for a dataset item from a LangFuse dataset run.

    Args:
        _dataset_run: The dataset run with items.
        _item: The dataset item.

    Returns:
        Trace data if found, otherwise None.
    """
    for item_run in _dataset_run:
        if item.id == item_run.dataset_item_id:
            return client.get_trace(item_run.trace_id)
    return None



# Check for environment variables from Langfuse
def check_environment_variables():
    """
    Checks the required environment variables based on the provider.
    """
    if not os.getenv('LANGFUSE_SECRET_KEY'):
        logging.error('Cannot proceed: LANGFUSE_SECRET_KEY is not defined.')
        sys.exit(1)
    if not os.getenv('LANGFUSE_HOST'):
        logging.error('Cannot proceed: LANGFUSE_HOST is not defined.')
        sys.exit(1)

if __name__ == '__main__':
    start_time = time.time()
    load_dotenv()  # Load environment variables from .env file

    cli_args = docopt(__doc__, version='Run Evaluation 1.0.0')

    log_format = '%(levelname)s:%(module)s:%(message)s'
    logging.basicConfig(level=logging.DEBUG if cli_args['-v'] else logging.INFO, format=log_format)

    check_environment_variables()
    experiment_name = cli_args['<experiment_name>']

    dataset_name = cli_args['<dataset_name>']
    client = init_langfuse()
    dataset = client.get_dataset(name=dataset_name)

    with open(cli_args['<rag_query>'], 'r') as file:
        rag_query = json.load(file)

    with open(cli_args['<metrics_json_file>'], 'r') as file:
        metric_json = json.load(file)

    ragas_evaluator = RagasEvaluator(
        rag_query=RagQuery(**rag_query),
        metric_names=metric_json["metric_names"]
    )

    for item in dataset.items:
        dataset_run = client.get_dataset_run(dataset_name=dataset_name, dataset_run_name=experiment_name)
        run_trace_details = fetch_trace_by_item_and_dataset_run(dataset_run.dataset_run_items, item)
        if run_trace_details and run_trace_details.output and isinstance(run_trace_details.output, dict):
            if run_trace_details.output['answer'] != 'NO_RAG_SENTENCEd':
                time.sleep(3)  # waiting for trace update
                ragas_evaluator.score_with_ragas(
                    item=item,
                    run_trace_details=run_trace_details,
                    experiment_name=experiment_name
                )
        else:
                logging.info(f"Impossible to evaluate item '{item.id}' of dataset '{dataset_name}' in experiment '{experiment_name}'!")

    logging.info(f"Total execution time: {time.time() - start_time:.2f} seconds")
