from dataclasses import dataclass


@dataclass
class AnswerAI:
    text: str
    # FootNote class
    footnotes = []


@dataclass
class ResponseIA:
    answer: AnswerAI
    error: []

