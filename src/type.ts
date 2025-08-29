export interface CandleData {
  date: string;
  low: number;
  high: number;
  volume: number;
  open: number;
  close: number;
}

export interface ApiResponse {
  candles: CandleData[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

export type TimeFrame = "hourly" | "daily" | "weekly" | "monthly";
