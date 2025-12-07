import type { MeasurementEntity } from "@/domain/entities/measurement/MeasurementEntity";
import type {
  MeasurementStats,
  StatsRange,
} from "@/domain/entities/measurement/MeasurementStats";

export interface CreateMeasurementPayload {
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  measuredAt?: string;
}

export interface UpdateMeasurementPayload extends Partial<CreateMeasurementPayload> {}

export interface IMeasurementRepository {
  getList(limit?: number): Promise<MeasurementEntity[]>;
  getOne(id: number): Promise<MeasurementEntity>;
  create(payload: CreateMeasurementPayload): Promise<MeasurementEntity>;
  update(id: number, payload: UpdateMeasurementPayload): Promise<MeasurementEntity>;
  remove(id: number): Promise<void>;
  getStats(range: StatsRange, limit?: number): Promise<MeasurementStats>;
}
