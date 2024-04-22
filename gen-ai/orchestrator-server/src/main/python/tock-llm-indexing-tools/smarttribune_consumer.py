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
"""Smart Tribune import data and formatter ofr send in opensearch.

Usage:
    smarttribune_consumer.py [-v]  <knowledge_base>  <base_url> <output_csv> [options]

Arguments:
    knowledge_base  name of the target knowledge base, ex: "name1 | name2 | name3"
    base_url    the base URL to prefix every FAQ entry's query parameter to
                create a full URL
    output_csv  path to the output, ready-to-index CSV file

Options:
    --tag_title=<value>
    -h --help   Show this screen
    --version   Show version
    -v          Verbose output for debugging (without this option, script will
                be silent but for errors)

Import and Format a Smart Tribune data by API  into a ready-to-index CSV file
(one 'title'|'url'|'text' line per filtered entry).
"""
import asyncio
import logging
import os
import sys
import urllib
from functools import partial
from pathlib import Path
from time import time
from urllib.parse import urlparse

import aiohttp
import aiometer
import pandas as pd
import requests
from aiohttp_socks import ProxyConnector
from docopt import docopt
from dotenv import load_dotenv


async def _get_number_page(row, token):
    # request numberPage of question with length page's equal to 200
    proxy = urllib.request.getproxies()['https']
    connector = ProxyConnector.from_url(url=proxy, rdns=True)

    async with aiohttp.ClientSession(connector=connector) as session:
        url = f'https://api-gateway.app.smart-tribune.com/v1/knowledge-bases/{row[1]}/search'
        headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'fr',
            'Authorization': f'Bearer {token}',
        }
        if cli_args['--tag_title']:
            body = dict(
                knowledgeType=['question'],
                channel='faq',
                filters=[{'name': cli_args['--tag_title'], 'type': 'tag'}],
            )
        else:
            body = dict(knowledgeType=['question'], channel='faq')
        params = {'limit': 200}

        async with session.post(
            url=url, json=body, headers=headers, params=params
        ) as response:
            if response.status != 200:
                print('Error:', response.status, await response.text())
                return 0
            response_json = await response.json()
            total_items = response_json['meta']['totalItems']
            if total_items != 0:
                number_page = response_json['meta']['numberPage']
                logging.debug(f'request all question, number of page {number_page}')
                return number_page
            return 0


async def _get_question(token, row, current_page):
    # request documentId and question by page with length page's equal to 200
    proxy = urllib.request.getproxies()['https']
    connector = ProxyConnector.from_url(url=proxy, rdns=True)
    async with aiohttp.ClientSession(connector=connector) as session:
        url = f'https://api-gateway.app.smart-tribune.com/v1/knowledge-bases/{row.iloc[0]}/search'
        headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'fr',
            'Authorization': f'Bearer {token}',
        }
        if cli_args['--tag_title'] is not None:
            body = dict(
                knowledgeType=['question'],
                channel='faq',
                filters=[{'name': cli_args['--tag_title'], 'type': 'tag'}],
            )
        else:
            body = dict(knowledgeType=['question'], channel='faq')
        params = dict(limit=200, page=current_page)

        async with session.post(
            url, json=body, headers=headers, params=params
        ) as response:
            if response.status != 200:
                print('Error:', response.status, await response.text())
                return row.iloc[0], row.iloc[1], None, None, None

            response_get_questions_json = await response.json()
            df_all_questions = pd.DataFrame(response_get_questions_json['data'])
            df_all_questions = df_all_questions.rename(
                columns={'title': 'Title', 'slug': 'URL'}
            )
            df_all_questions['knowledge_base_id'] = row.iloc[0]
            df_all_questions['channel_id'] = row.iloc[1]
            return df_all_questions[
                ['knowledge_base_id', 'channel_id', 'documentId', 'Title', 'URL']
            ]


async def _get_answer(token, row):
    # Créer une connexion proxy
    proxy = urllib.request.getproxies()['https']
    connector = ProxyConnector.from_url(url=proxy, rdns=True)

    # Définir les en-têtes de la requête
    headers = {
        'Content-Type': 'application/json',
        'Accept-Language': 'fr',
        'Authorization': f'Bearer {token}',
    }
    if cli_args['--tag_title'] is not None:
        headers['customResponses'] = cli_args['--tag_title']

    # Définir l'URL de la requête
    url = f"https://api-gateway.app.smart-tribune.com/v1/knowledge-bases/{row['knowledge_base_id']}/questions/{row['documentId']}/channels/{row['channel_id']}/responses"

    # Utiliser le circuit breaker pour effectuer la requête
    async with aiohttp.ClientSession(connector=connector) as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                row['Text'] = None
                print('Error:', response.status, await response.text())
                return row[
                    [
                        'knowledge_base_id',
                        'channel_id',
                        'documentId',
                        'Title',
                        'URL',
                        'Text',
                    ]
                ]

            response_json = await response.json()
            row['Text'] = response_json['data'][0]['content']['body']
            return row[
                [
                    'knowledge_base_id',
                    'channel_id',
                    'documentId',
                    'Title',
                    'URL',
                    'Text',
                ]
            ]


async def _main(args):
    """
    import data from Smart Tribune API then format it into a ready-to-index CSV file.

        Parameters:
        args (dict): A dictionary containing command-line arguments.
                    Expecting keys:    '<knowledge_base>'
                                        '<tag_title>'
                                        '<base_url>'
                                        '<output_csv>'
    """

    # receipt auth token
    _start = time()
    logging.debug(f'request token with apiKey and apiSecret')
    url = 'https://api-gateway.app.smart-tribune.com/v1/auth'
    headers = {'Content-Type': 'application/json'}
    body = dict(apiKey=os.getenv('APIKEY'), apiSecret=os.getenv('APISECRET'))
    response_auth = requests.post(url, json=body, headers=headers)

    if not response_auth.ok:
        print('Error:', response_auth.status_code, response_auth.text)

    # save token
    token = response_auth.json()['token']

    # request knowledge bases accessible with this token
    url = 'https://api-gateway.app.smart-tribune.com/v1/knowledge-bases?limit=200'
    headers = {
        'Content-Type': 'application/json',
        'Accept-Language': 'fr',
        'Authorization': f'Bearer {token}',
    }
    logging.debug('request allowed knowledge bases list and associated channels')
    response_allowed_knowledge_bases = requests.get(url, headers=headers)

    if not response_allowed_knowledge_bases.ok:
        print(
            'Error:',
            response_allowed_knowledge_bases.status_code,
            response_allowed_knowledge_bases.text,
        )

    # filter knowledge base id and faq channel id associated
    results_allowed_knowledge_bases = response_allowed_knowledge_bases.json()['data']
    filtered_data = filter(
        lambda item: item['name'] in cli_args['<knowledge_base>']
        and any(channel['systemName'] == 'faq' for channel in item['channels']),
        results_allowed_knowledge_bases,
    )
    knowledge_bases_id_list = [
        (
            item['id'],
            next(
                channel['id']
                for channel in item['channels']
                if channel['systemName'] == 'faq'
            ),
        )
        for item in filtered_data
    ]
    df_knowledge_bases = pd.DataFrame(
        knowledge_bases_id_list, columns=['knowledge_base_id', 'channel_id']
    )
    logging.debug('request knowledge page id and channel id')

    # receipt number_page by knowledge_bases
    coroutines = [
        _get_number_page(row, token) for row in df_knowledge_bases.itertuples()
    ]
    number_pages = await asyncio.gather(*coroutines, return_exceptions=False)
    df_knowledge_bases['number_page'] = pd.Series(number_pages)

    # receipt question by knowledge_base_id
    coroutines = [
        _get_question(token, row, current_page)
        for _, row in df_knowledge_bases.iterrows()
        for current_page in range(1, row.iloc[2] + 1)
    ]
    rawdata = await asyncio.gather(*coroutines, return_exceptions=False)
    logging.debug(f'request question by page')
    df_all_questions = pd.concat([pd.DataFrame(page) for page in rawdata])

    # receipt answer by documentId
    _startGetAnswers = time()
    rawdata = await aiometer.run_all(
        [partial(_get_answer, token, row[1]) for row in df_all_questions.iterrows()],
        max_at_once=20,
        max_per_second=20,  # here we can set max rate per second
    )
    df_all_questions = pd.DataFrame(rawdata)
    logging.debug(f'request answer by question')

    # format data
    df_all_questions['URL'] = (
        cli_args['<base_url>'] + '?question=' + df_all_questions['URL']
    )
    logging.debug(f"Export to output CSV file {args['<output_csv>']}")
    logging.debug(
        f'finished {len(df_all_questions)} questions in {time() - _start:.2f} seconds'
    )
    df_all_questions[['Title', 'URL', 'Text']].to_csv(
        args['<output_csv>'], sep='|', index=False
    )


if __name__ == '__main__':
    load_dotenv()
    cli_args = docopt(__doc__, version='Smart Tribune consumer 0.1.0')

    # Set logging level
    log_format = '%(levelname)s:%(module)s:%(message)s'
    logging.basicConfig(
        level=logging.DEBUG if cli_args['-v'] else logging.WARNING, format=log_format
    )

    # Check args:
    knowledge_base = cli_args['<knowledge_base>'].split('|')
    print(knowledge_base)
    if not knowledge_base:
        logging.error(
            f"Cannot proceed: knowledgebase name '{cli_args['<knowledge_base>']}' does not exist"
        )
        sys.exit(1)
    # - tag title is arbitrary

    # - base url must be valid
    result = urlparse(cli_args['<base_url>'])
    if not result.scheme or not result.netloc:
        logging.error(f"Cannot proceed: '{cli_args['<base_url>']}' is not a valid URL")
        sys.exit(1)

    # - output file path
    target_dir = Path(cli_args['<output_csv>']).parent
    if not target_dir.exists():
        logging.error(f'Cannot proceed: directory {target_dir} does not exist')
        sys.exit(1)

    # Main func
    asyncio.run(_main(cli_args))
