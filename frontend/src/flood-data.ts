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
  alertLevel: AlertLevel;
  prob1h: number;
  prob3h: number;
  prob6h: number;
};
