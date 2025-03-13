"""
Run an evaluation on LangFuse dataset experiment.
Usage:
        run_evaluation.py [-v] <evaluation_input_file>
        run_evaluation.py -h | --help
        run_evaluation.py --version

Arguments:
    dataset_name        the dataset name
    experiment_name     the experiment name

Options:
    -v          Verbose output
    -h --help   Show this screen
    --version   Show version
"""
from datetime import datetime
from typing import Optional, List

from docopt import docopt
from gen_ai_orchestrator.services.security.security_service import fetch_secret_key_value
from langfuse import Langfuse
from langfuse.api import TraceWithFullDetails, DatasetRunItem
from langfuse.client import DatasetItemClient

from scripts.common.logging_config import configure_logging
from scripts.evaluation.models import RunEvaluationInput, DatasetExperimentItemScores, RunEvaluationOutput, \
    DatasetExperiment, ActivityStatus
from scripts.evaluation.ragas_evaluator import RagasEvaluator


def get_trace_if_exists(logger, client, dataset_name, experiment_name, _dataset_run, item) -> [Optional[DatasetRunItem], Optional[TraceWithFullDetails]]:
    item_run = next((r for r in _dataset_run if r.dataset_item_id == item.id), None)

    if item_run:
        return item_run, client.get_trace(item_run.trace_id)

    logger.info(f"No trace found for '{item.id}' of dataset '{dataset_name}' in experiment '{experiment_name}!")
    return None, None

def main():
    start_time = datetime.now()
    cli_args = docopt(__doc__, version='Run Evaluation 1.0.0')
    logger = configure_logging(cli_args)


    dataset_experiment = DatasetExperiment()
    experiment_scores: List[DatasetExperimentItemScores] = []
    dataset_items: List[DatasetItemClient] = []

    try:
        logger.info("Loading input data...")
        evaluation_input = RunEvaluationInput.from_json_file(cli_args["<evaluation_input_file>"])
        logger.debug(f"\n{evaluation_input.format()}")

        client = Langfuse(
            host=str(evaluation_input.observability_setting.url),
            public_key=evaluation_input.observability_setting.public_key,
            secret_key=fetch_secret_key_value(evaluation_input.observability_setting.secret_key),
        )
        ragas_evaluator = RagasEvaluator(langfuse_client=client, evaluation_input=evaluation_input)

        dataset_experiment=evaluation_input.dataset_experiment
        dataset_name=dataset_experiment.dataset_name
        experiment_name=dataset_experiment.experiment_name
        dataset = client.get_dataset(name=dataset_name)
        dataset_items = dataset.items

        for item in dataset_items:
            dataset_run = client.get_dataset_run(
                dataset_name=dataset_name,
                dataset_run_name=experiment_name
            )
            run_item, run_trace_details = get_trace_if_exists(logger, client, dataset_name, experiment_name, dataset_run.dataset_run_items, item)
            if run_trace_details and run_trace_details.output and isinstance(run_trace_details.output, dict):
                metric_scores = ragas_evaluator.score_with_ragas(
                    item=item,
                    run_trace_details=run_trace_details,
                    experiment_name=experiment_name
                )
                experiment_scores.append(
                    DatasetExperimentItemScores(
                        run_item_id=run_item.id,
                        run_trace_id=run_trace_details.id,
                        metric_scores=metric_scores
                    )
                )
            else:
                logger.warn(f"Impossible to evaluate item '{item.id}' of dataset '{dataset_name}' in experiment '{experiment_name}'!")

        activity_status = ActivityStatus.COMPLETED
    except Exception as e:
        activity_status = ActivityStatus.FAILED
        logger.error(e)

    len_dataset_items = len(dataset_items)
    output = RunEvaluationOutput(
        status = activity_status,
        dataset_experiment=dataset_experiment,
        dataset_experiment_scores=experiment_scores,
        duration = datetime.now() - start_time,
        nb_dataset_items=len(dataset_items),
        pass_rate=100 * (len(experiment_scores) / len_dataset_items) if len_dataset_items > 0 else 0
    )
    logger.debug(f"\n{output.format()}")

if __name__ == '__main__':
    main()
