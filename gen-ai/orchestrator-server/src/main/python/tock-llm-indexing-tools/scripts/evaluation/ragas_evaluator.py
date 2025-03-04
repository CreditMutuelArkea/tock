import json
import logging
import time

from gen_ai_orchestrator.routers.requests.requests import RagQuery
from gen_ai_orchestrator.services.langchain.factories.langchain_factory import create_observability_callback_handler, \
    get_llm_factory, get_em_factory
from langfuse.api import TraceWithFullDetails
from ragas.dataset_schema import SingleTurnSample
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper
from ragas.metrics.base import MetricWithLLM, MetricWithEmbeddings
from ragas.run_config import RunConfig

from generate_dataset import init_langfuse
from scripts.evaluation.ragas_metrics import ragas_available_metrics


class RagasEvaluator:
    def __init__(self, rag_query: RagQuery, metric_names: []):
        question_answering_llm_factory = get_llm_factory(setting=rag_query.question_answering_llm_setting)
        em_factory = get_em_factory(setting=rag_query.embedding_question_em_setting)
        llm = question_answering_llm_factory.get_language_model()
        embedding = em_factory.get_embedding_model()
        observability_setting = rag_query.observability_setting

        self.metrics = list(filter(lambda ragas_metric: ragas_metric["name"] in metric_names, ragas_available_metrics))

        for m in self.metrics:
            metric = m['metric']
            if isinstance(metric, MetricWithLLM):
                metric.llm = LangchainLLMWrapper(llm)
            if isinstance(metric, MetricWithEmbeddings):
                metric.embeddings = LangchainEmbeddingsWrapper(embedding)
            run_config = RunConfig()
            metric.init(run_config)

        self.observability_setting = observability_setting
        self.client_langfuse = init_langfuse()


    def score_with_ragas(self, query, chunks, answer, ground_truth, run_trace):
        scores = {}

        for m in self.metrics:
            metric = m['metric']
            metric_name = m["name"]
            sample = SingleTurnSample(
                user_input=query,
                retrieved_contexts=chunks,
                response=answer,
                reference=ground_truth
            )
            logging.info(
                f'Calculating {metric_name} score...'
            )
            observability_handler = create_observability_callback_handler(
                observability_setting=self.observability_setting,
                trace_name=metric_name,
            )
            score = metric.single_turn_score(sample, callbacks=[observability_handler])
            logging.debug(
                f'Calculating {metric_name} score = {score}'
            )
            trace = observability_handler.trace
            statements_reasons = ""
            if m['hasReason']:
                time.sleep(3) # waiting for trace update
                trace_full: TraceWithFullDetails = self.client_langfuse.get_trace(trace.id)
                observations = trace_full.observations
                last_gen_item = next((obs for obs in reversed(observations) if obs.type == "GENERATION"), None)
                if last_gen_item is not None and last_gen_item.output is not None:
                    parsed_data = json.loads(last_gen_item.output["content"].strip("```json").strip("```").strip())
                    if parsed_data.get("statements", []) :
                        statements_reasons = " | ".join([stmt["reason"] for stmt in parsed_data["statements"]])

            scores[metric_name] = {
                'value': score,
                'reasons': statements_reasons,
                'trace_id': trace.id
            }

        for metric_name, score in scores.items():
            run_trace.score(
                name=metric_name,
                value=score['value'],
                comment=" : ".join(filter(None, [score['trace_id'], score['reasons']]))
            )

        return scores
