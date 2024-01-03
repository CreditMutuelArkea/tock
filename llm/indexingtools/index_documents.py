#   Copyright (C) 2023 Credit Mutuel Arkea
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
"""Index a ready-to-index CSV file ('title'|'url'|'text' lines) file contents 
into an OpenSearch vector database.

Usage:
    index_documents.py [-v] <input_csv> <index_name> <embeddings_cfg> <chunks_size> [<env_file>]
    index_documents.py -h | --help
    index_documents.py --version

Arguments:
    input_csv      path to the ready-to-index file
    index_name      name of the OpenSearch index (shall follow indexes 
                    naming rules)
    embeddings_cfg  path to an embeddings configuration file (JSON format)
    chunks_size     size of the embedded chunks of documents
    env_file        path to an alternative env file name (.env is loaded 
                    if left unspecified)

Options:
    -h --help   Show this screen
    --version   Show version
    -v          Verbose output for debugging (without this option, script will 
                be silent but for errors)

Index a ready-to-index CSV file contents into an OpenSearch vector database. 
CSV columns are 'title'|'url'|'text'. 'text' will be chunked according to 
chunks_size, and embedded using configuration described in embeddings_cfg (it 
uses the embeddings constructor from the orchestrator module, so JSON file 
shall follow corresponding format). Documents will be indexed in OpenSearch DB 
under index_name index (index_name shall follow OpenSearch naming restrictions).
"""
from datetime import datetime
import json
from uuid import uuid4
from docopt import docopt
import logging
from pathlib import Path
import sys, os
from dotenv import load_dotenv

from langchain.document_loaders import CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import OpenSearchVectorSearch

from llm_orchestrator.models.em.azureopenai.azure_openai_em_setting import AzureOpenAIEMSetting
from llm_orchestrator.services.langchain.factories.langchain_factory import get_em_factory
from llm_orchestrator.services.langchain.factories.em.azure_openai_em_factory import AzureOpenAIEMFactory


def index_documents(args):
    """
    Read a ready-to-index CSV file, then index its contents to an OpenSearch DB.
    
        Parameters:
        args (dict): A dictionary containing command-line arguments.
                    Expecting keys: '<input_csv>'
                                    '<index_name>'
                                    '<embeddings_cfg>'
                                    '<chunks_size>'
    """
    # unique date / uuid for each indexing session (stored as metadata)
    formatted_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    session_uuid = uuid4().hex[0:8]
    logging.debug(f"Beginning indexation session {session_uuid} at '{formatted_datetime}'")

    logging.debug(f"Read input CSV file {args['<input_csv>']}")
    csv_loader = CSVLoader(file_path=args['<input_csv>'], 
                           source_column="url", 
                           metadata_columns=("title","url"), 
                           csv_args={'delimiter': '|', 
                                     'quotechar': '"'})
    docs = csv_loader.load()
    for doc in docs:
        doc.metadata['index_session_id'] = session_uuid
        doc.metadata['index_datetime'] = formatted_datetime

    logging.debug(f"Split texts in {args['<chunks_size>']} characters-sized chunks")
    # recursive splitter is used to preserve sentences & paragraphs
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=int(args['<chunks_size>']))
    splitted_docs = text_splitter.split_documents(docs)
    logging.debug(f"Split {len(docs)} texts in {len(splitted_docs)} chunks")

    logging.debug(f"Get embeddings model from {args['<embeddings_cfg>']} config file")
    with open(args['<embeddings_cfg>'], 'r') as file:
        config_dict = json.load(file)
    em_settings = AzureOpenAIEMSetting(**config_dict)
    em_factory = get_em_factory(em_settings)
    em_factory.check_embedding_model_setting()
    embeddings = em_factory.get_embedding_model()

    opensearch_url = 'https://admin:admin@' + os.getenv('OPENSEARCH_HOST') + ":" + os.getenv('OPENSEARCH_PORT')
    logging.debug(f"Connect to DB at {opensearch_url}")
    opensearch_db = OpenSearchVectorSearch(index_name=args['<index_name>'], 
                                           embedding_function=embeddings, 
                                           opensearch_url=opensearch_url, 
                                           verify_certs=False)
    logging.debug(f"Index chunks in DB")
    opensearch_db.from_documents(splitted_docs, 
                                 embeddings,
                                 index_name = args['<index_name>'],
                                 opensearch_url=opensearch_url, 
                                 verify_certs=False)


def index_name_is_valid(index_name):
    """
    Check if index_name is a valid OpenSearch index name.
    (https://opensearch.org/docs/latest/api-reference/index-apis/create-index)
    """
    if not index_name.islower():
        logging.error("Index name must be all lowercase")
        return False

    if index_name.startswith('_') or index_name.startswith('-'):
        logging.error("Index names can’t begin with underscores (_) or hyphens (-)")
        return False

    # List of invalid characters
    invalid_chars = [":", "\"", "*", "+", "/", "\\", "|", "?", "#", ">", "<", ",", " "]
    for char in invalid_chars:
        if char in index_name:
            logging.error(f"Index name contains invalid character: {char}")
            return False

    return True


if __name__ == '__main__':
    cli_args = docopt(__doc__, version='Webscraper 0.1.0')
    
    # Set logging level
    log_format = '%(levelname)s:%(module)s:%(message)s'
    logging.basicConfig(level=logging.DEBUG if cli_args['-v'] else logging.WARNING, format=log_format)

    # Check args:
    # - input file path
    inputfile_path = Path(cli_args['<input_csv>'])
    if not inputfile_path.exists():
        logging.error(f"Cannot proceed: input CSV file '{cli_args['<input_csv>']}' does not exist")
        sys.exit(1)
    
    # - index name
    if not index_name_is_valid(cli_args['<index_name>']):
        logging.error(f"Cannot proceed: index name {cli_args['<index_name>']} is not a valid OpenSearch index name")
        sys.exit(1)

    # - embeddings config JSON file
    cfg_file_path = Path(cli_args['<embeddings_cfg>'])
    if not cfg_file_path.exists():
        logging.error(f"Cannot proceed: embeddings config file '{cli_args['<embeddings_cfg>']}' does not exist")
        sys.exit(1)
    try:
        with open(cfg_file_path, 'r') as file:
            json.load(file)
    except json.JSONDecodeError:
        logging.error(f"Cannot proceed: embeddings config file '{cli_args['<embeddings_cfg>']}' is not a valid JSON file")
        sys.exit(1)

    # - chunks size
    try:
        int(cli_args['<chunks_size>'])
    except ValueError:
        logging.error(f"Cannot proceed: chunks size ({cli_args['<chunks_size>']}) is not a number")
        sys.exit(1)

    # .env file
    load_dotenv()  # Load environment variables from .env into environment
    if os.getenv("OPENSEARCH_HOST") == None:
        logging.error(f"Cannot proceed: env var 'OPENSEARCH_HOST' is not defined")
        sys.exit(1)
    if os.getenv("OPENSEARCH_PORT") == None:
        logging.error(f"Cannot proceed: env var 'OPENSEARCH_PORT' is not defined")
        sys.exit(1)

    # Check args:
    index_documents(cli_args)