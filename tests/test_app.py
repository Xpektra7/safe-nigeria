from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_predict_endpoint_returns_expected_schema():
    response = client.post('/predict', json={'water_level': 4.0, 'rainfall': 45.0})

    assert response.status_code == 200

    payload = response.json()

    assert isinstance(payload, dict)
    assert set(payload) == {
        'prob_1h',
        'prob_3h',
        'prob_6h',
        'flood_alert_1h',
        'flood_alert_3h',
        'flood_alert_6h',
        'alert_level',
        'current_level_cm',
    }
    assert payload['current_level_cm'] == 400.0
    assert payload['alert_level'] in {'GREEN', 'YELLOW', 'RED'}


def test_reset_endpoint():
    response = client.post('/reset')

    assert response.status_code == 200
    assert response.json() == {'status': 'buffer cleared'}


def test_predict_endpoint_rejects_invalid_payload():
    response = client.post('/predict', json={'water_level': -1, 'rainfall': 45.0})

    assert response.status_code == 422
