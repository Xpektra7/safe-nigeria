from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from predictor import predict, reset_buffer


def test_predictor_returns_green_before_buffer_fills():
    reset_buffer()

    result = predict(4.0, 45.0)

    assert result == {
        'prob_1h': 0.0,
        'prob_3h': 0.0,
        'prob_6h': 0.0,
        'flood_alert_1h': False,
        'flood_alert_3h': False,
        'flood_alert_6h': False,
        'alert_level': 'GREEN',
        'current_level_cm': 400.0,
    }


def test_predictor_returns_valid_prediction_after_buffer_fills():
    reset_buffer()

    result = None
    for i in range(3):
        result = predict(4.0 + (i * 0.01), 45.0)

    assert result is not None
    assert set(result) == {
        'prob_1h',
        'prob_3h',
        'prob_6h',
        'flood_alert_1h',
        'flood_alert_3h',
        'flood_alert_6h',
        'alert_level',
        'current_level_cm',
    }
    assert result['current_level_cm'] == 402.0
    assert result['alert_level'] in {'GREEN', 'YELLOW', 'RED'}
