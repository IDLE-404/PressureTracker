export type MeasurementStatus =
  | "normal"
  | "prehypertension"
  | "elevated"
  | "high"
  | "danger";

export interface MeasurementEntity {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  measuredAt: string;
  status: MeasurementStatus;
}
