import csv
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from predictor import predict, predict_sequence, reset_buffer

try:
    import psycopg
except ImportError:  # pragma: no cover
    psycopg = None

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / 'floodsense_nigeria_dataset.csv'


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue

        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_env_file(BASE_DIR / '.env')

SUPABASE_URL = os.getenv('SUPABASE_URL', '').rstrip('/')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
SUPABASE_HISTORY_TABLE = os.getenv('SUPABASE_HISTORY_TABLE', 'flood_readings')
SUPABASE_INGEST_TABLE = os.getenv('SUPABASE_INGEST_TABLE', SUPABASE_HISTORY_TABLE)
INGEST_API_KEY = os.getenv('INGEST_API_KEY', '')
DATABASE_URL = os.getenv('DATABASE_URL', '')
HISTORY_LIMIT = int(os.getenv('HISTORY_LIMIT', '12'))

app = FastAPI(title='FloodSense Nigeria API', version='1.0.0')
app.add_middleware(CORSMiddleware,allow_origins=['*'],allow_methods=['*'],allow_headers=['*'])

class SensorReading(BaseModel):
    water_level: float = Field(...,description='Water level METRES',ge=0,le=10, json_schema_extra={'example': 4.0})
    rainfall:    float = Field(...,description='Rainfall mm',ge=0, json_schema_extra={'example': 100.0})
    timestamp:   str   = Field(default_factory=lambda:datetime.now(timezone.utc).isoformat())

class FloodPrediction(BaseModel):
    prob_1h:float; prob_3h:float; prob_6h:float
    flood_alert_1h:bool; flood_alert_3h:bool; flood_alert_6h:bool
    alert_level:str; current_level_cm:float

class FloodHistoryEntry(BaseModel):
    id: int
    timestamp: str
    station: str
    waterLevelCm: float
    rainfallMm: float
    alertLevel: str
    prob1h: float
    prob3h: float
    prob6h: float


class IngestReading(BaseModel):
    station: str = Field(..., min_length=1)
    water_level: float = Field(..., ge=0, le=10)
    rainfall: float = Field(..., ge=0)
    timestamp: str | None = None


class IngestResult(BaseModel):
    status: str
    alert_level: str
    current_level_cm: float


def _load_history():
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        try:
            return _load_history_from_supabase()
        except Exception:
            pass

    if DATASET_PATH.exists():
        return _load_history_from_csv()

    return []


def _score_history_rows(rows):
    readings = [
        {
            'timestamp': row['timestamp'],
            'water_level_cm': float(row['water_level_cm']),
            'rainfall_mm': float(row['rainfall_mm']),
        }
        for row in rows
    ]
    predictions = predict_sequence(readings)

    history = []
    stations = ['Nembe Creek', 'Amassoma', 'Ogbia Axis', 'Yenagoa North', 'Sagbama', 'Ekeremor']
    for index, (row, prediction) in enumerate(zip(rows, predictions), start=1):
        history.append({
            'id': index,
            'timestamp': row['timestamp'],
            'station': row.get('station') or stations[(index - 1) % len(stations)],
            'waterLevelCm': round(float(row['water_level_cm']), 1),
            'rainfallMm': round(float(row['rainfall_mm']), 1),
            'alertLevel': prediction['alert_level'],
            'prob1h': prediction['prob_1h'],
            'prob3h': prediction['prob_3h'],
            'prob6h': prediction['prob_6h'],
        })

    return history


def _db_connect():
    if not DATABASE_URL:
        raise RuntimeError('DATABASE_URL is not configured')
    if psycopg is None:
        raise RuntimeError('psycopg is not installed')
    return psycopg.connect(DATABASE_URL)


def _load_history_from_csv():
    with DATASET_PATH.open(newline='') as handle:
        rows = list(csv.DictReader(handle))[-HISTORY_LIMIT:]

    normalized = [
        {
            'timestamp': row['timestamp'].replace(' ', 'T') + 'Z',
            'water_level_cm': row['water_level_cm'],
            'rainfall_mm': row['rainfall_mm'],
        }
        for row in rows
    ]

    return _score_history_rows(normalized)


def _load_history_from_supabase():
    with _db_connect() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                f'''
                select id, timestamp, station, water_level_cm, rainfall_mm, alert_level, prob_1h, prob_3h, prob_6h
                from {SUPABASE_HISTORY_TABLE}
                order by timestamp desc
                limit %s
                ''',
                (HISTORY_LIMIT,)
            )
            rows = cursor.fetchall()

    rows = list(reversed(rows))
    if rows and len(rows[0]) >= 9:
        return [
            {
                'id': row[0],
                'timestamp': row[1].isoformat() if hasattr(row[1], 'isoformat') else str(row[1]),
                'station': row[2],
                'waterLevelCm': round(float(row[3]), 1),
                'rainfallMm': round(float(row[4]), 1),
                'alertLevel': row[5],
                'prob1h': float(row[6]),
                'prob3h': float(row[7]),
                'prob6h': float(row[8]),
            }
            for row in rows
        ]

    return []

@app.post('/predict',response_model=FloodPrediction)
def predict_flood(reading:SensorReading):
    try:
        return predict(water_level_m=reading.water_level,
                       rainfall_mm=reading.rainfall,
                       timestamp=reading.timestamp)
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.get('/health')
def health(): return {'status':'ok'}

@app.post('/reset')
def reset(): reset_buffer(); return {'status':'buffer cleared'}

@app.get('/history', response_model=list[FloodHistoryEntry])
def history():
    try:
        return _load_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/ingest', response_model=IngestResult)
def ingest_reading(reading: IngestReading, x_ingest_api_key: str | None = Header(default=None)):
    if not INGEST_API_KEY or x_ingest_api_key != INGEST_API_KEY:
        raise HTTPException(status_code=401, detail='invalid ingest key')

    timestamp = reading.timestamp or datetime.now(timezone.utc).isoformat()
    prediction = predict(
        water_level_m=reading.water_level,
        rainfall_mm=reading.rainfall,
        timestamp=timestamp,
    )

    try:
        with _db_connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    f'''
                    insert into {SUPABASE_INGEST_TABLE} (
                      timestamp,
                      station,
                      water_level_cm,
                      rainfall_mm,
                      alert_level,
                      prob_1h,
                      prob_3h,
                      prob_6h
                    ) values (%s, %s, %s, %s, %s, %s, %s, %s)
                    ''',
                    (
                        timestamp,
                        reading.station,
                        round(reading.water_level * 100, 1),
                        round(reading.rainfall, 1),
                        prediction['alert_level'],
                        prediction['prob_1h'],
                        prediction['prob_3h'],
                        prediction['prob_6h'],
                    ),
                )
            conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        'status': 'ingested',
        'alert_level': prediction['alert_level'],
        'current_level_cm': prediction['current_level_cm'],
    }
