from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_essay_rejects_too_short_topic():
    response = client.post(
        "/api/essay",
        json={"topic": "AI"}
    )
    assert response.status_code == 422

def test_essay_rejects_empty_topic():
    response = client.post(
        "/api/essay",
        json={"topic": ""}
    )
    assert response.status_code == 422
