import json
from datetime import datetime
from datetime import timedelta
from enum import Enum, auto, unique
from typing import List, Optional

import humanize
from gen_ai_orchestrator.models.em.em_types import EMSetting
from gen_ai_orchestrator.models.llm.llm_types import LLMSetting
from gen_ai_orchestrator.models.observability.langfuse.langfuse_setting import LangfuseObservabilitySetting
from pydantic import BaseModel, Field
from colorama import Fore, init, Style

class DatasetExperiment(BaseModel):
    dataset_name: str = Field(description='The dataset name.', default='UNKNOWN')
    experiment_name: str = Field(description='The name of the dataset experiment.', default='UNKNOWN')


class RunEvaluationInput(BaseModel):
    metric_names: List[str] = Field(
        description='The list of RAGAS metric names.',
        default=["SemanticSimilarity"]
    )
    llm_setting: Optional[LLMSetting] = Field(
        description='LLM setting, used to calculate the LLM-based metric.',
        default=None
    )
    em_setting: Optional[EMSetting] = Field(
        description='Embeddings setting, used to calculate the Embeddings-based metric.',
        default=None
    )
    observability_setting: LangfuseObservabilitySetting = Field(
        description='The Langfuse observability settings.'
    )
    dataset_experiment: DatasetExperiment = Field(
        description='The dataset experiment to evaluate.'
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
            Langfuse environment : {str(self.observability_setting.url)}
            The dataset name     : {self.dataset_experiment.dataset_name}
            The experiment name  : {self.dataset_experiment.experiment_name}
            Metrics              : {" | ".join(self.metric_names)}
        """

        # Find the longest line in the details
        lines = details_str.splitlines()
        max_line_length = max(len(line) for line in lines)

        # The text for the header
        header_text = " RUN EVALUATION INPUT "

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


class MetricScore(BaseModel):
    metric_name: str = Field(description='The metric name.')
    value: float = Field(description='The metric value.')
    reason: str = Field(description='The reason for the score value.')
    trace_id: str = Field(description='The trace ID for metric calculation.')

class DatasetExperimentItemScores(BaseModel):
    run_item_id: str = Field(description='The item ID in the dataset experience.')
    run_trace_id: str = Field(description='The trace ID for the item in the dataset experience.')
    metric_scores: List[MetricScore] = Field(
        description='The metric scores.',
        default=["SemanticSimilarity"]
    )

@unique
class ActivityStatus(str, Enum):
    COMPLETED = auto()
    STARTING = auto()
    STARTED = auto()
    STOPPING = auto()
    STOPPED = auto()
    FAILED = auto()
    ABANDONED = auto()
    UNKNOWN = auto()


class OutputStatus(BaseModel):
    status: ActivityStatus = Field(
        description='The activity status.'
    )

class RunEvaluationOutput(OutputStatus):
    dataset_experiment: DatasetExperiment = Field(
        description='The dataset experiment to evaluate.'
    )
    dataset_experiment_scores: List[DatasetExperimentItemScores] = Field(
        description='Scores for the dataset experiment.'
    )
    duration: timedelta = Field(description='The evaluation time.')
    nb_dataset_items: int = Field(description='Number of items in dataset.')
    pass_rate: float = Field(description='Rate of successful evaluations.')

    def format(self):
        # Format the details string
        details_str = f"""
            The dataset name               : {self.dataset_experiment.dataset_name}
            The experiment name            : {self.dataset_experiment.experiment_name}
            Number of items in dataset     : {self.nb_dataset_items}
            Rate of successful evaluations : {self.pass_rate:.2f}%
            Duration                       : {humanize.precisedelta(self.duration)}
            Date                           : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        """

        # Find the longest line in the details
        lines = details_str.splitlines()
        max_line_length = max(len(line.strip()) for line in lines)

        # The text for the header
        header_text = " RUN EVALUATION OUTPUT "

        # Construct the header and separator lines
        separator = '-' * max_line_length
        header_line = header_text.center(max_line_length, '-')

        # Format status line
        status_line = f" STATUS: {self.status.name} ".center(max_line_length)

        # Return the formatted string
        to_string = f"{header_line}\n{details_str}\n{separator}"
        to_string_strip="\n".join(line.strip() for line in to_string.splitlines() if line.strip())
        return f'{to_string_strip}\n{status_line}\n{separator}'

