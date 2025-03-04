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
    rag_testing_tool.py [-v] <rag_query> <dataset_name> <test_name> <metrics_json_file>
    rag_testing_tool.py -h | --help
    rag_testing_tool.py --version

Arguments:
    rag_query       path to a JSON 'RAGQuery' JSON file containing RAG settings
                    to be tested: llm model, embedding model, vector database
                    provider, indexation session's unique id, and 'k', i.e. nb
                    of retrieved docs (question and chat history are ignored,
                    as they will come from the dataset)
    dataset_name    the reference dataset name
    test_name       name of the test run

Options:
    -h --help   Show this screen
    --version   Show version
    -v          Verbose output for debugging (without this option, script will
                be silent but for errors)

Build a RAG (Lang)chain from the RAG Query and runs it against the provided
LangFuse dataset. The chain is created anew for each entry of the dataset.
"""
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from docopt import docopt
from dotenv import load_dotenv
from gen_ai_orchestrator.routers.requests.requests import RagQuery
from gen_ai_orchestrator.services.langchain.rag_chain import create_rag_chain

from evaluation.ragas_evaluator import RagasEvaluator
from generate_dataset import init_langfuse


def test_rag(args):
    """
    Test RAG endpoint settings against a reference dataset.

    Args:

        args (dict):    A dictionary containing command-line arguments.
                        Expecting keys: '<rag_query>'
                                        '<dataset_name>'
                                        '<test_name>'
                                        '<metrics_json_file>'
    """
    start_time = datetime.now()

    with open(args['<rag_query>'], 'r') as file:
        rag_query = json.load(file)

    with open(args['<metrics_json_file>'], 'r') as file:
        metric_json = json.load(file)

    def _construct_chain():
        # Modify this if you are testing against a dataset that follows another
        # format
        return {
            'question': lambda x: x['question'],
            'locale': lambda x: x['locale'],
            'no_answer': lambda x: x['no_answer'],
            'chat_history': lambda x: x['chat_history'] if 'chat_history' in x else [],
        } | create_rag_chain(RagQuery(**rag_query), vector_db_async_mode=False)

    def run_dataset():
            client = init_langfuse()
            dataset = client.get_dataset(args['<dataset_name>'])

            ragas_evaluator = RagasEvaluator(rag_query = RagQuery(**rag_query), metric_names = metric_json["metric_names"])

            for item in dataset.items:
                callback_handlers = []
                handler = item.get_langchain_handler(
                    run_name=run_name_dataset,
                    run_metadata={
                        'document_index_name': document_index_name,
                        'k': k,
                    },
                )
                callback_handlers.append(handler)
                response = _construct_chain().invoke(
                    item.input, config={'callbacks': callback_handlers}
                )

                ragas_evaluator.score_with_ragas(
                    query = item.input["question"],
                    chunks = list(map(lambda doc: doc.page_content, response['documents'])),
                    answer = response['answer'],
                    ground_truth = item.expected_output['answer'],
                    run_trace = handler.trace,
                )

                waiting = 15
                url_local = "http://localhost:3000/project/cm3ppuejm00017mhij24ybw19/datasets/cm60x54qs0007qbtm8v7cbahv/items"
                url_rec = "https://langfuse.inference-rec.s.arkea.com/project/clz1awyq8001hsgj5n7dz6nib/datasets/cm7j4nafl00ac13pbx5sli7c8/items"
                print(f'Waiting {waiting}s... {url_local}/{item.id}')
                client.flush()
                exit(1)
                time.sleep(waiting)
            client.flush()

    document_index_name = rag_query['document_index_name']
    search_params = rag_query['document_search_params']
    k = search_params['k']

    run_name_dataset = args['<test_name>'] + '-' + str(uuid4())[:8]
    run_dataset()

    duration = datetime.now() - start_time
    hours, remainder = divmod(duration.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    formatted_duration = '{:02}:{:02}:{:02}'.format(hours, minutes, seconds)
    logging.debug(
        f'Ran RAGQuery (k={k}, document_index_name={document_index_name}) on '
        f"{args['<dataset_name>']} dataset (duration: {formatted_duration})"
    )


if __name__ == '__main__':
    cli_args = docopt(__doc__, version='RAG Testing Tool 0.1.0')

    # Set logging level
    log_format = '%(levelname)s:%(module)s:%(message)s'
    logging.basicConfig(
        level=logging.DEBUG if cli_args['-v'] else logging.WARNING, format=log_format
    )

    load_dotenv()
    langfuse_secret_key = os.getenv('LANGFUSE_SECRET_KEY')
    if not langfuse_secret_key:
        logging.error(
            'Cannot proceed: LANGFUSE_SECRET_KEY env variable is not defined (define it in a .env file)'
        )
        sys.exit(1)
    langchain_host = os.getenv('LANGFUSE_HOST')
    if not langchain_host:
        logging.error(
            'Cannot proceed: LANGFUSE_HOST env variable is not defined (define it in a .env file)'
        )
        sys.exit(1)
    langfuse_public_key = os.getenv('LANGFUSE_PUBLIC_KEY')
    if not langfuse_public_key:
        logging.error(
            'Cannot proceed: LANGFUSE_PUBLIC_KEY env variable is not defined (define it in a .env file)'
        )
        sys.exit(1)

    # Check args:
    # - RAGQuery JSON file
    rag_query_file_path = Path(cli_args['<rag_query>'])
    if not rag_query_file_path.exists():
        logging.error(
            f"Cannot proceed: RAGQuery JSON file '{cli_args['<rag_query>']}' does not exist"
        )
        sys.exit(1)
    try:
        with open(rag_query_file_path, 'r') as file:
            rag_query = json.load(file)
    except json.JSONDecodeError:
        logging.error(
            f"Cannot proceed: RAGQuery JSON file '{cli_args['<rag_query>']}' is not a valid JSON file"
        )
        sys.exit(1)

    # - dataset name is always valid
    # - test name is always valid

    # Main func
    test_rag(cli_args)
