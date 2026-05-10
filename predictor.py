import numpy as np, pandas as pd, joblib, json
from pathlib import Path
from collections import deque
from datetime import datetime, timezone

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / 'models'

def _artifact_path(name):
    candidates = [MODELS_DIR / name, BASE_DIR / name]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError(f'missing artifact: {name}')

_models = {h: joblib.load(_artifact_path(f'xgb_flood_{h}.joblib')) for h in ['1h','3h','6h']}
with open(_artifact_path('model_config.json')) as f: _cfg = json.load(f)

FEATURE_COLS       = _cfg['feature_cols']
FLOOD_THRESHOLD_CM = _cfg['flood_threshold_cm']
DECISION_THRESHOLD = _cfg['decision_threshold']
_buffer = deque(maxlen=80)

def _build_features(buf):
    df = pd.DataFrame(buf).sort_values('timestamp').reset_index(drop=True)
    df['rainfall_1h']  = df['rainfall_mm'].rolling(1,  min_periods=1).sum()
    df['rainfall_3h']  = df['rainfall_mm'].rolling(3,  min_periods=1).sum()
    df['rainfall_6h']  = df['rainfall_mm'].rolling(6,  min_periods=1).sum()
    df['rainfall_24h'] = df['rainfall_mm'].rolling(24, min_periods=1).sum()
    df['level_rate_of_change'] = df['water_level_cm'].diff().fillna(0)
    ts = pd.to_datetime(df['timestamp'])
    df['hour_of_day'] = ts.dt.hour
    df['day_of_year'] = ts.dt.dayofyear
    df['antecedent_soil_moisture'] = df['rainfall_mm'].rolling(72,min_periods=1).sum()
    df['level_2h_ago']      = df['water_level_cm'].shift(2).bfill()
    df['level_6h_ago']      = df['water_level_cm'].shift(6).bfill()
    df['level_accel']       = df['level_rate_of_change'].diff().fillna(0)
    df['rain_intensity_6h'] = df['rainfall_mm'].rolling(6,min_periods=1).max()
    df['hour_sin'] = np.sin(2*np.pi*df['hour_of_day']/24)
    df['hour_cos'] = np.cos(2*np.pi*df['hour_of_day']/24)
    df['doy_sin']  = np.sin(2*np.pi*df['day_of_year']/365)
    df['doy_cos']  = np.cos(2*np.pi*df['day_of_year']/365)
    df['rain_x_rising'] = df['rainfall_3h']*df['level_rate_of_change'].clip(lower=0)
    return df

def _score_buffer(buf):
    df_f   = _build_features(list(buf))
    latest = df_f.iloc[[-1]][FEATURE_COLS]
    probs  = {h:float(_models[h].predict_proba(latest)[0,1]) for h in ['1h','3h','6h']}
    alerts = {h:probs[h]>=DECISION_THRESHOLD for h in probs}
    wl_cm = float(buf[-1]['water_level_cm'])
    if wl_cm>=FLOOD_THRESHOLD_CM or probs['1h']>=0.70 or probs['3h']>=0.70:
        level='RED'
    elif alerts['3h']:
        level='YELLOW'
    else:
        level='GREEN'
    return {'prob_1h':round(probs['1h'],4),'prob_3h':round(probs['3h'],4),
            'prob_6h':round(probs['6h'],4),
            'flood_alert_1h':bool(alerts['1h']),'flood_alert_3h':bool(alerts['3h']),
            'flood_alert_6h':bool(alerts['6h']),
            'alert_level':level,'current_level_cm':round(wl_cm,1)}

def predict_sequence(readings):
    buf = deque(maxlen=80)
    results = []
    for reading in readings:
        buf.append({
            'timestamp': reading['timestamp'],
            'water_level_cm': reading['water_level_cm'],
            'rainfall_mm': reading['rainfall_mm'],
        })
        if len(buf) < 3:
            results.append({
                'prob_1h':0.0,'prob_3h':0.0,'prob_6h':0.0,
                'flood_alert_1h':False,'flood_alert_3h':False,'flood_alert_6h':False,
                'alert_level':'GREEN','current_level_cm':round(float(reading['water_level_cm']),1)
            })
        else:
            results.append(_score_buffer(buf))
    return results

def predict(water_level_m, rainfall_mm, timestamp=None):
    wl_cm = water_level_m * 100.0
    ts    = timestamp or datetime.now(timezone.utc).isoformat()
    _buffer.append({'timestamp':ts,'water_level_cm':wl_cm,'rainfall_mm':rainfall_mm})
    if len(_buffer) < 3:
        return {'prob_1h':0.0,'prob_3h':0.0,'prob_6h':0.0,
                'flood_alert_1h':False,'flood_alert_3h':False,'flood_alert_6h':False,
                'alert_level':'GREEN','current_level_cm':wl_cm}
    return _score_buffer(_buffer)

def reset_buffer(): _buffer.clear()
