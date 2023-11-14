<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

LLM Orchestrator is the server that handle all LLMs operations : Retrieval Augmented Generation, synthetic sentences generatio. This server is called by Bot API RAG story.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


* [![Python][Python]][Python-url]
* [![FastApi][FastApi]][FastApi-url]
* [![Azure][Azure]][Azure-url]
* [![AWS][AWS]][AWS-url]
* [![LangChain][LangChain]][LangChain-url]
* [![OpenAI][OpenAI]][OpenAI-url]
* [![AzureOpenAI][AzureOpenAI]][AzureOpenAI-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* python 3.9+ | poetry
  ```sh
  apt install python3 poetry
  ```
  It's recommended to use pyenv (https://gist.github.com/trongnghia203/9cc8157acb1a9faad2de95c3175aa875)

* Vector Database
  ```sh
  OpenSearch (Docker Compose)
  # https://opensearch.org/docs/latest/install-and-configure/install-opensearch/docker/
  # Or you can use the docker-compose present in tock-docker for opensearch
  ```
### Dev

Install pre-commit: pip install pre-commit
Add pre-commit to requirements.txt (or requirements-dev.txt)
Define .pre-commit-config.yaml with the hooks you want to include.
Execute pre-commit install to install git hooks in your .git/ directory.


### Installation

1. Install python packages
   ```sh
    cd {PATH_TO_PROJECT}/tock/llm/orchestrator-server/src/main/python/app
    poetry install
   ```
2. Install python packages
   ```sh
    source venv/bin/activate
    python3.9 -m pip install -r src/requirements/base.txt
    python3.9 -m pip install -r src/requirements/dev.txt
   ```
3. Enter your API keys in `.env`
   ```sh
    API_KEY = 'ENTER YOUR API'
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Uvicorn Fast API : Go to
   ```sh
    http://localhost:8000/
   ```

_For more information, please refer to the [Documentation](https://example.com) and [Swagger](http://localhost:8000/docs)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[product-screenshot]: images/screenshot.png

[Python]: https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54
[Python-url]: https://www.langchain.com/
[FastApi]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white
[FastApi-url]: https://fastapi.tiangolo.com/
[LangChain]: https://img.shields.io/badge/LangChain-LIB-blue
[LangChain-url]: https://www.langchain.com/
[OpenAI]: https://img.shields.io/badge/OpenAI-LLM-blue
[OpenAI-url]: https://openai.com/
[AzureOpenAI]: https://img.shields.io/badge/AzureOpenAI-LLM-blue
[AzureOpenAI-url]: https://azure.microsoft.com/fr-fr/products/ai-services/openai-service
[OpenSearch]: https://img.shields.io/badge/OpenSearch-AWS-blue
[OpenSearch-url]: https://opensearch.org/
[Azure]: https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white
[Azure-url]: https://azure.microsoft.com/
[AWS]: https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white
[AWS-url]: https://aws.amazon.com/
