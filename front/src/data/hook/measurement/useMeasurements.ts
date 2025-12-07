import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateMeasurementPayload,
  UpdateMeasurementPayload,
} from "@/domain/repositories/measurement/IMeasurementRepository";
import { MeasurementRepositoryApi } from "@/data/repositories/measurement/MeasurementRepositoryApi";
import type { StatsRange } from "@/domain/entities/measurement/MeasurementStats";

const repo = new MeasurementRepositoryApi();

export const useMeasurementsQuery = (limit = 50) =>
  useQuery({
    queryKey: ["measurements", limit],
    queryFn: () => repo.getList(limit),
  });

export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMeasurementPayload) => repo.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useUpdateMeasurement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMeasurementPayload;
    }) => repo.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useDeleteMeasurement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repo.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useStatsQuery = (range: StatsRange, limit = 30) =>
  useQuery({
    queryKey: ["stats", range, limit],
    queryFn: () => repo.getStats(range, limit),
  });
