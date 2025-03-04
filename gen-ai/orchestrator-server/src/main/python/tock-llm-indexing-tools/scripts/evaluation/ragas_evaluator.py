import json
import logging
import math
import time
from typing import List

from gen_ai_orchestrator.routers.requests.requests import RagQuery
from gen_ai_orchestrator.services.langchain.factories.langchain_factory import create_observability_callback_handler, \
    get_llm_factory, get_em_factory
from langfuse.api import TraceWithFullDetails
from langfuse.client import DatasetItemClient
from ragas.dataset_schema import SingleTurnSample
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper
from ragas.metrics.base import MetricWithLLM, MetricWithEmbeddings
from ragas.run_config import RunConfig

from generate_dataset import init_langfuse
from scripts.evaluation.ragas_metrics import ragas_available_metrics


class RagasEvaluator:
    def __init__(self, rag_query: RagQuery, metric_names: List[str]):
        # Initialize LLM and embedding models
        llm_factory = get_llm_factory(setting=rag_query.question_answering_llm_setting)
        em_factory = get_em_factory(setting=rag_query.embedding_question_em_setting)

        llm = llm_factory.get_language_model()
        embedding = em_factory.get_embedding_model()

        self.observability_setting = rag_query.observability_setting
        self.client_langfuse = init_langfuse()

        # Filter selected metrics
        self.metrics = [
            metric for metric in ragas_available_metrics if metric["name"] in metric_names
        ]

        # Initialize metrics
        run_config = RunConfig()
        for metric_entry in self.metrics:
            metric = metric_entry['metric']
            if isinstance(metric, MetricWithLLM):
                metric.llm = LangchainLLMWrapper(llm)
            if isinstance(metric, MetricWithEmbeddings):
                metric.embeddings = LangchainEmbeddingsWrapper(embedding)
            metric.init(run_config)

    def extract_input_data(self, item, run_trace):
        query = item.input["question"]
        chunks = [doc["page_content"] for doc in run_trace.output["documents"]]
        answer = run_trace.output["answer"]
        ground_truth = item.expected_output['answer']
        run_trace = self.client_langfuse.trace(id=run_trace.id)
        return query, chunks, answer, ground_truth, run_trace

    def fetch_statements_reasons(self, trace_id):
        time.sleep(3)  # Waiting for trace update
        trace_full = self.client_langfuse.get_trace(trace_id)
        observations = trace_full.observations
        last_gen_item = next((obs for obs in reversed(observations) if obs.type == "GENERATION"), None)
        if last_gen_item and last_gen_item.output:
            parsed_data = json.loads(last_gen_item.output["content"].strip("```json").strip("```"))
            if parsed_data.get("statements", []):
                return " | ".join([stmt["reason"] for stmt in parsed_data["statements"]])
        return ""

    def calculate_metric_score(self, metric, metric_name, sample, item, experiment_name):
        logging.info(
            f"Calculating {metric_name} score for item '{item.id}' of dataset '{item.dataset_name}' in experiment '{experiment_name}"
        )
        observability_handler = create_observability_callback_handler(
            observability_setting=self.observability_setting, trace_name=metric_name
        )
        score = metric.single_turn_score(sample, callbacks=[observability_handler])
        return -1 if math.isnan(float(score)) else score, observability_handler.trace

    def score_with_ragas(self, item: DatasetItemClient, run_trace_details: TraceWithFullDetails, experiment_name: str):
        query, chunks, answer, ground_truth, run_trace = self.extract_input_data(item, run_trace_details)

        scores = {}
        for m in self.metrics:
            metric = m['metric']
            metric_name = m["name"]
            sample = SingleTurnSample(user_input=query, retrieved_contexts=chunks, response=answer,
                                      reference=ground_truth)

            score, trace = self.calculate_metric_score(metric, metric_name, sample, item, experiment_name)

            statements_reasons = "The score is not a number! There must be an error in the metric calculation." if score == -1 else ""
            if score != -1 and m['hasReason']:
                statements_reasons = self.fetch_statements_reasons(trace.id)

            scores[metric_name] = {'value': score, 'reasons': statements_reasons, 'trace_id': trace.id}
            logging.info(f"Metric {metric_name} -> score = {score}")

        for metric_name, score_data in scores.items():
            run_trace.score(
                name=metric_name,
                value=score_data['value'],
                comment=" : ".join(filter(None, [score_data['trace_id'], score_data['reasons']]))
            )

        return scores
