from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, List, Tuple

from drift_detector import calculate_drift_vectorized
from escalation import escalation_status

Predictor = Callable[[List[str]], List[Tuple[List[Dict[str, float]], float]]]


def _default_predictor(texts: List[str]) -> List[Tuple[List[Dict[str, float]], float]]:
    # Lazy import keeps API startup fast and test-friendly.
    from emotion_model import predict_emotions_batch

    return predict_emotions_batch(texts)


@dataclass
class AnalysisResult:
    emotions: List[Dict[str, float]]
    weighted_score: float
    drift_score: float
    risk_level: str

    @property
    def top_emotion(self) -> Dict[str, float]:
        return self.emotions[0] if self.emotions else {"label": "neutral", "score": 0.0}

    @property
    def escalation_required(self) -> bool:
        return self.risk_level == "HIGH RISK"


class AnalysisService:
    def __init__(self, predictor: Predictor | None = None) -> None:
        self._predictor = predictor or _default_predictor

    def analyze_message(self, message: str, timeline: List[dict]) -> AnalysisResult:
        prediction_batches = self._predictor([message])
        if not prediction_batches:
            raise ValueError("Predictor returned no predictions")

        emotions, weighted_score = prediction_batches[0]
        if not emotions:
            raise ValueError("Predictor returned empty emotion list")

        augmented_timeline = list(timeline) + [
            {"message": message, "emotions": emotions, "score": float(weighted_score)}
        ]
        drift_score = calculate_drift_vectorized(augmented_timeline)
        risk_level = escalation_status(augmented_timeline)
        return AnalysisResult(
            emotions=emotions,
            weighted_score=float(weighted_score),
            drift_score=float(drift_score),
            risk_level=risk_level,
        )

