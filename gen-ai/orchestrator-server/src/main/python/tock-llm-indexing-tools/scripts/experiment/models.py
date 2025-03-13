import json
import os
from datetime import datetime
from datetime import timedelta
from enum import Enum, auto, unique
from typing import List, Optional

import humanize
from gen_ai_orchestrator.models.em.em_types import EMSetting
from gen_ai_orchestrator.models.llm.llm_types import LLMSetting
from gen_ai_orchestrator.models.observability.langfuse.langfuse_setting import LangfuseObservabilitySetting
from gen_ai_orchestrator.routers.requests.requests import RagQuery
from pydantic import BaseModel, Field
from colorama import Fore, init, Style

from scripts.evaluation.models import DatasetExperiment, OutputStatus


class RunExperimentInput(BaseModel):
    rag_query: RagQuery = Field(
        description='The RAG query.'
    )
    dataset_experiment: DatasetExperiment = Field(
        description='The dataset to experiment.'
    )
    rate_limit_delay: int = Field(
        description='Waiting time (in seconds) to prevent the LLM rate limite.'
    )

    @classmethod
    def from_json_file(cls, file_path: str):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return cls(**data)
        except FileNotFoundError:
            raise ValueError(f"The file '{file_path}' is not found!")
        except json.JSONDecodeError:
            raise ValueError(f"the file '{file_path}' is not a valid JSON!")

    def format(self):
        # Format the details string
        details_str = f"""
            Langfuse environment : {str(self.rag_query.observability_setting.url)}
            The dataset name     : {self.dataset_experiment.dataset_name}
            The experiment name  : {self.dataset_experiment.experiment_name}
            Rate limit delay     : {self.rate_limit_delay}s
        """

        # Find the longest line in the details
        lines = details_str.splitlines()
        max_line_length = max(len(line) for line in lines)

        # The text for the header
        header_text = " RUN EXPERIMENT INPUT "

        # Calculate the number of dashes needed on both sides
        total_dashes = max_line_length - len(header_text)
        left_dashes = total_dashes // 2
        right_dashes = total_dashes - left_dashes

        # Construct the header and separator lines
        separator = '-' * max_line_length
        header_line = '-' * left_dashes + header_text + '-' * right_dashes

        # Return the formatted string
        to_string = f"{header_line}\n{details_str}\n{separator}"
        return "\n".join(line.strip() for line in to_string.splitlines() if line.strip())


class RunExperimentOutput(OutputStatus):
    rag_query: Optional[RagQuery] = Field(
        description='The RAG query.'
    )
    dataset_experiment: DatasetExperiment = Field(
        description='The dataset to experiment.'
    )
    duration: timedelta = Field(description='The experiment time.')
    nb_dataset_items: int = Field(description='Number of items in dataset.')
    pass_rate: float = Field(description='Rate of successful experiment.')

    def format(self):
        # Format the details string
        details_str = f"""
            The dataset name               : {self.dataset_experiment.dataset_name}
            The experiment name            : {self.dataset_experiment.experiment_name}
            Number of items in dataset     : {self.nb_dataset_items}
            Rate of successful experiment  : {self.pass_rate:.2f}%
            Duration                       : {humanize.precisedelta(self.duration)}
            Date                           : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        """

        rag_config_str = "UNKNOWN"
        if self.rag_query is not None:
            rag_config_str = f"""
                The document index name        : {self.rag_query.document_index_name}
                The knn                        : {self.rag_query.document_search_params.k}
                The LLM model                  : {self.rag_query.question_answering_llm_setting.model} ({self.rag_query.question_answering_llm_setting.provider})
                The EM model                   : {self.rag_query.embedding_question_em_setting.model} ({self.rag_query.embedding_question_em_setting.provider})
                The LLM temperature            : {self.rag_query.question_answering_llm_setting.temperature}
            """

        # Find the longest line in the details
        max_line_length = max(max(len(line.strip()) for line in details_str.splitlines()), max(len(line.strip()) for line in rag_config_str.splitlines()))

        # The text for the header
        header_text = " RUN EXPERIMENT OUTPUT "

        # Construct the header and separator lines
        separator = '-' * max_line_length
        header_line = header_text.center(max_line_length, '-')

        # Format status line
        status_line = f" STATUS: {self.status.status.name} ".center(max_line_length)

        if self.status.status_reason:
            status_reason_line = f" REASON: {self.status.status_reason} ".center(max_line_length)
            status_line = f'{status_line}\n{status_reason_line}'

        # Return the formatted string
        to_string = f"{header_line}\n{details_str}\n{separator}\n{rag_config_str}\n{separator}"
        to_string_strip="\n".join(line.strip() for line in to_string.splitlines() if line.strip())
        return f'{to_string_strip}\n{status_line}\n{separator}'

