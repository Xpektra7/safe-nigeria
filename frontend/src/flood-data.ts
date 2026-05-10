export type AlertLevel = "GREEN" | "YELLOW" | "RED";

export type FloodIncident = {
  id: number;
  timestamp: string;
  station: string;
  waterLevelCm: number;
  rainfallMm: number;
  alertLevel: AlertLevel;
  prob1h: number;
  prob3h: number;
  prob6h: number;
};

export type TrendPoint = {
  time: string;
  waterLevelCm: number;
  rainfallMm: number;
  prob1h: number;
  prob3h: number;
  prob6h: number;
};

export const floodIncidents: FloodIncident[] = [
  {
    id: 1,
    timestamp: "2026-05-08T06:00:00Z",
    station: "Nembe Creek",
    waterLevelCm: 372,
    rainfallMm: 12.4,
    alertLevel: "YELLOW",
    prob1h: 0.31,
    prob3h: 0.52,
    prob6h: 0.68,
  },
  {
    id: 2,
    timestamp: "2026-05-08T06:30:00Z",
    station: "Amassoma",
    waterLevelCm: 381,
    rainfallMm: 18.1,
    alertLevel: "YELLOW",
    prob1h: 0.38,
    prob3h: 0.59,
    prob6h: 0.73,
  },
  {
    id: 3,
    timestamp: "2026-05-08T07:00:00Z",
    station: "Ogbia Axis",
    waterLevelCm: 394,
    rainfallMm: 24.7,
    alertLevel: "YELLOW",
    prob1h: 0.42,
    prob3h: 0.64,
    prob6h: 0.79,
  },
  {
    id: 4,
    timestamp: "2026-05-08T07:30:00Z",
    station: "Yenagoa North",
    waterLevelCm: 402,
    rainfallMm: 31.5,
    alertLevel: "RED",
    prob1h: 0.55,
    prob3h: 0.71,
    prob6h: 0.84,
  },
  {
    id: 5,
    timestamp: "2026-05-08T08:00:00Z",
    station: "Sagbama",
    waterLevelCm: 408,
    rainfallMm: 37.8,
    alertLevel: "RED",
    prob1h: 0.62,
    prob3h: 0.76,
    prob6h: 0.87,
  },
  {
    id: 6,
    timestamp: "2026-05-08T08:30:00Z",
    station: "Ekeremor",
    waterLevelCm: 412,
    rainfallMm: 45.0,
    alertLevel: "RED",
    prob1h: 0.68,
    prob3h: 0.8,
    prob6h: 0.89,
  },
  {
    id: 7,
    timestamp: "2026-05-08T09:00:00Z",
    station: "Nembe Creek",
    waterLevelCm: 416,
    rainfallMm: 51.2,
    alertLevel: "RED",
    prob1h: 0.72,
    prob3h: 0.83,
    prob6h: 0.9,
  },
  {
    id: 8,
    timestamp: "2026-05-08T09:30:00Z",
    station: "Amassoma",
    waterLevelCm: 409,
    rainfallMm: 48.7,
    alertLevel: "RED",
    prob1h: 0.65,
    prob3h: 0.79,
    prob6h: 0.88,
  },
  {
    id: 9,
    timestamp: "2026-05-08T10:00:00Z",
    station: "Ogbia Axis",
    waterLevelCm: 422,
    rainfallMm: 56.3,
    alertLevel: "RED",
    prob1h: 0.76,
    prob3h: 0.86,
    prob6h: 0.92,
  },
  {
    id: 10,
    timestamp: "2026-05-08T10:30:00Z",
    station: "Yenagoa North",
    waterLevelCm: 427,
    rainfallMm: 61.9,
    alertLevel: "RED",
    prob1h: 0.81,
    prob3h: 0.88,
    prob6h: 0.94,
  },
  {
    id: 11,
    timestamp: "2026-05-08T11:00:00Z",
    station: "Sagbama",
    waterLevelCm: 431,
    rainfallMm: 65.4,
    alertLevel: "RED",
    prob1h: 0.84,
    prob3h: 0.9,
    prob6h: 0.95,
  },
  {
    id: 12,
    timestamp: "2026-05-08T11:30:00Z",
    station: "Ekeremor",
    waterLevelCm: 436,
    rainfallMm: 69.8,
    alertLevel: "RED",
    prob1h: 0.87,
    prob3h: 0.92,
    prob6h: 0.96,
  },
];

export const trendData: TrendPoint[] = floodIncidents.map((row) => ({
  time: new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  waterLevelCm: row.waterLevelCm,
  rainfallMm: row.rainfallMm,
  prob1h: row.prob1h * 100,
  prob3h: row.prob3h * 100,
  prob6h: row.prob6h * 100,
}));

export const latestIncident = floodIncidents[floodIncidents.length - 1];
