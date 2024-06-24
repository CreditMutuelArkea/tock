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
"""API Client to consume AWS Secrets Manager API"""

import json
import logging
from typing import Optional, Type, TypeVar

import boto3
from botocore.exceptions import ClientError

from gen_ai_orchestrator.models.security.ai_provider_secret import (
    AIProviderSecret,
)
from gen_ai_orchestrator.models.security.credentials import Credentials

logger = logging.getLogger(__name__)
T = TypeVar('T')


class AWSSecretsManagerClient:
    """AWS Secrets Manager Client."""

    def __init__(self):
        self.client = boto3.client(service_name='secretsmanager')

    def get_credentials(self, secret_name: str) -> Optional[Credentials]:
        """
        Get a user credentials
        Expected storage format of the secret : {"username":"opensearch-user","password":"op******3"}

        Args:
            secret_name: The AWS Secret Name
        """

        return parse_secret_data(self.get_secret(secret_name), Credentials)

    def get_ai_provider_secret(self, secret_name: str) -> Optional[AIProviderSecret]:
        """
        Get the AI provider secret
        Expected storage format of the secret : {"secret":"op******3"}

        Args:
            secret_name: The AWS Secret Name
        """

        return parse_secret_data(self.get_secret(secret_name), AIProviderSecret)

    def get_secret(self, secret_name: str):
        """
        Retrieve individual secret by name, using the get_secret_value API.
        :param secret_name: The name of the secret to be fetched.
        """

        try:
            get_secret_value_response = self.client.get_secret_value(
                SecretId=secret_name
            )
            logging.info(
                f'The requested secret {secret_name} has been successfully retrieved.'
            )
            return get_secret_value_response['SecretString']
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                logger.error(f'The requested secret {secret_name} was not found.')
                raise
            else:
                logger.error(f'Error retrieving {secret_name} secret.')
                raise
        except Exception as e:
            logger.error(f'An unknown error occurred: {str(e)}.')
            raise


def parse_secret_data(secret_data, obj_type: Type[T]) -> Optional[T]:
    """
    Parse the JSON secret data to retrieve an object of specified type.
    Args:
        secret_data: A json data
        obj_type: Type of object to return

    Returns:
        The object of specified type.

    Raises:
         JSONDecodeError otherwise
    """
    try:
        secret_dict = json.loads(secret_data)
        return obj_type(**secret_dict)
    except json.JSONDecodeError as e:
        logger.error(f'Error parsing secret data: {str(e)}')
        return None
