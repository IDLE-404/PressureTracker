export type StatsRange = "day" | "week" | "month";

export interface MeasurementStatsPoint {
  bucket: string;
  count: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number | null;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
}

export interface MeasurementStats {
  range: StatsRange;
  data: MeasurementStatsPoint[];
}
