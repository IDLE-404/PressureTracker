import apiClient from "@/data/datasources/api/apiClient";
import type { MeasurementEntity } from "@/domain/entities/measurement/MeasurementEntity";
import type {
  MeasurementStats,
  MeasurementStatsPoint,
  StatsRange,
} from "@/domain/entities/measurement/MeasurementStats";
import type {
  CreateMeasurementPayload,
  IMeasurementRepository,
  UpdateMeasurementPayload,
} from "@/domain/repositories/measurement/IMeasurementRepository";

type MeasurementDTO = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  measuredAt: string;
  status:
    | "normal"
    | "prehypertension"
    | "elevated"
    | "high"
    | "danger";
};

type StatsDTO = {
  range: StatsRange;
  data: Array<{
    bucket: string;
    count: number;
    avgSystolic: number;
    avgDiastolic: number;
    avgPulse: number | null;
    minSystolic: number;
    maxSystolic: number;
    minDiastolic: number;
    maxDiastolic: number;
  }>;
};

const mapMeasurement = (dto: MeasurementDTO): MeasurementEntity => ({
  id: dto.id,
  systolic: dto.systolic,
  diastolic: dto.diastolic,
  pulse: dto.pulse,
  measuredAt: dto.measuredAt,
  status: dto.status,
});

const mapStats = (dto: StatsDTO): MeasurementStats => ({
  range: dto.range,
  data: dto.data.map(
    (row): MeasurementStatsPoint => ({
      bucket: row.bucket,
      count: row.count,
      avgSystolic: row.avgSystolic,
      avgDiastolic: row.avgDiastolic,
      avgPulse: row.avgPulse,
      minSystolic: row.minSystolic,
      maxSystolic: row.maxSystolic,
      minDiastolic: row.minDiastolic,
      maxDiastolic: row.maxDiastolic,
    })
  ),
});

export class MeasurementRepositoryApi implements IMeasurementRepository {
  async getList(limit = 50): Promise<MeasurementEntity[]> {
    const { data } = await apiClient.get<MeasurementDTO[]>(
      `/measurements?limit=${limit}`
    );
    return data.map(mapMeasurement);
  }

  async getOne(id: number): Promise<MeasurementEntity> {
    const { data } = await apiClient.get<MeasurementDTO>(`/measurements/${id}`);
    return mapMeasurement(data);
  }

  async create(payload: CreateMeasurementPayload): Promise<MeasurementEntity> {
    const { data } = await apiClient.post<MeasurementDTO>(
      "/measurements",
      payload
    );
    return mapMeasurement(data);
  }

  async update(
    id: number,
    payload: UpdateMeasurementPayload
  ): Promise<MeasurementEntity> {
    const { data } = await apiClient.patch<MeasurementDTO>(
      `/measurements/${id}`,
      payload
    );
    return mapMeasurement(data);
  }

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/measurements/${id}`);
  }

  async getStats(range: StatsRange, limit = 30): Promise<MeasurementStats> {
    const { data } = await apiClient.get<StatsDTO>(
      `/stats/summary?range=${range}&limit=${limit}`
    );
    return mapStats(data);
  }
}
