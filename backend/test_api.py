
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_empty_message_is_rejected():
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422