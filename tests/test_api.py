from fastapi.testclient import TestClient

from app import app
from services.analysis_service import AnalysisService
from uuid import uuid4


def _mock_predictor(texts):
    return [
        (
            [
                {"label": "anger", "score": 0.91},
                {"label": "annoyance", "score": 0.62},
                {"label": "neutral", "score": 0.12},
            ],
            1.65,
        )
        for _ in texts
    ]


def _auth_headers(client: TestClient):
    email = f"test-{uuid4().hex[:8]}@example.com"
    response = client.post(
        "/auth/register",
        json={"email": email, "password": "Password123!"},
    )
    assert response.status_code == 200
    verification_token = response.json().get("verification_token")
    assert verification_token
    verify_response = client.post("/auth/verify-email", json={"token": verification_token})
    assert verify_response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_predict_emotion_contract():
    with TestClient(app) as client:
        app.state.analysis_service = AnalysisService(predictor=_mock_predictor)
        headers = _auth_headers(client)

        response = client.post(
            "/predict-emotion",
            json={"message": "this service is broken", "session_id": "session-a"},
            headers=headers,
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["emotion"] == "anger"
        assert payload["session_id"] == "session-a"
        assert "drift_score" in payload
        assert "risk_level" in payload


def test_timeline_scoped_by_session():
    with TestClient(app) as client:
        app.state.analysis_service = AnalysisService(predictor=_mock_predictor)
        headers = _auth_headers(client)

        client.post("/predict-emotion", json={"message": "a", "session_id": "session-a"}, headers=headers)
        client.post("/predict-emotion", json={"message": "b", "session_id": "session-b"}, headers=headers)

        timeline_a = client.get("/timeline", params={"session_id": "session-a"}, headers=headers).json()["timeline"]
        timeline_b = client.get("/timeline", params={"session_id": "session-b"}, headers=headers).json()["timeline"]
        assert len(timeline_a) == 1
        assert len(timeline_b) == 1
        assert timeline_a[0]["message"] == "a"
        assert timeline_b[0]["message"] == "b"


def test_predict_validation_error():
    with TestClient(app) as client:
        headers = _auth_headers(client)
        response = client.post("/predict-emotion", json={"message": ""}, headers=headers)
        assert response.status_code == 422
        payload = response.json()
        assert payload["error"] == "validation_error"


def test_reset_requires_agent_or_admin():
    with TestClient(app) as client:
        email = f"viewer-{uuid4().hex[:8]}@example.com"
        register = client.post(
            "/auth/register",
            json={"email": email, "password": "Password123!", "role": "viewer"},
        )
        token = register.json()["verification_token"]
        client.post("/auth/verify-email", json={"token": token})
        access_token = register.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        response = client.post("/reset", headers=headers)
        assert response.status_code == 403

