# --- Install dependencies
FROM docker-registry.s.arkea.com/arkea/python:3.11 AS builder

WORKDIR /app

# Install gcloud
RUN curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz \
    && tar -xf google-cloud-cli-linux-x86_64.tar.gz \
    && google-cloud-sdk/install.sh --usage-reporting false --quiet

# Install poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_VERSION=1.8.3 POETRY_HOME=/app/poetry python3 -

ENV VENV=/app/.venv \
    INDEXING_ENV=tock-llm-indexing-tools \
    ORCH_ENV=server

RUN python3 -m venv ${VENV}

COPY --chown=dockerapp --chmod=500 ${INDEXING_ENV}/pyproject.toml ${INDEXING_ENV}/poetry.lock ${INDEXING_ENV}/
COPY --chown=dockerapp --chmod=500 ${ORCH_ENV}/ ${ORCH_ENV}/

RUN . ${VENV}/bin/activate && poetry/bin/poetry install \
    --no-cache \
    --no-root \
    --directory=${INDEXING_ENV}

# --- Execute script
FROM docker-registry.s.arkea.com/arkea/python3.11-slim:latest@sha256:0b6e6cc27f348b9a18a660d7a4b96ee812545bdacf4183ac8661f6cd10e01a2a AS script

WORKDIR /app

RUN apt-get install -y jq

ENV VENV=/app/.venv \
    INDEXING_ENV=tock-llm-indexing-tools \
    ORCH_ENV=server

COPY --from=builder ${VENV} ${VENV}
COPY --from=builder /app/google-cloud-sdk /usr/local/google-cloud-sdk

COPY --chown=dockerapp --chmod=500 ${INDEXING_ENV}/index_documents.py index_documents.py
COPY --chown=dockerapp --chmod=500 ${INDEXING_ENV}/indexing_details.py indexing_details.py
COPY --chown=dockerapp --chmod=500 ${ORCH_ENV}/ ${ORCH_ENV}


ENV PATH="${VENV}/bin:/usr/local/google-cloud-sdk/bin:${PATH}"
ENTRYPOINT [ "python", "index_documents.py" ]
