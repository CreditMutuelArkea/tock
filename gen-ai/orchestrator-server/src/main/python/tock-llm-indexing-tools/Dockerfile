# --- Install dependencies
FROM docker-registry.s.arkea.com/arkea/python:3.11 AS builder

WORKDIR /app

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

ENV VENV=/app/.venv \
    INDEXING_ENV=tock-llm-indexing-tools

COPY --from=builder ${VENV} ${VENV}

COPY --chown=dockerapp --chmod=500 ${INDEXING_ENV}/index_documents.py index_documents.py

ENV PATH="${VENV}/bin:${PATH}"
ENTRYPOINT [ "python", "index_documents.py" ]
