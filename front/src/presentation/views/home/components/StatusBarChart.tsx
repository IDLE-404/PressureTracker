import type { MeasurementEntity } from "@/domain/entities/measurement/MeasurementEntity";
import styles from "../Home.module.css";

const statusOrder = ["normal", "prehypertension", "elevated", "high", "danger"] as const;

const statusCopy: Record<
  (typeof statusOrder)[number],
  { label: string; color: string }
> = {
  normal: { label: "Норма", color: "#2dd4bf" },
  prehypertension: { label: "Повышенное", color: "#22c55e" },
  elevated: { label: "Высокое", color: "#f59e0b" },
  high: { label: "Очень высокое", color: "#fb923c" },
  danger: { label: "Опасно", color: "#ef4444" },
};

interface Props {
  measurements: MeasurementEntity[];
}

export const StatusBarChart = ({ measurements }: Props) => {
  if (!measurements.length) {
    return <div className={styles.chartEmpty}>Нет данных для диаграммы статусов</div>;
  }

  const counts = statusOrder.map((status) => ({
    status,
    count: measurements.filter((m) => m.status === status).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className={styles.barCard}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>Диаграмма по статусам</div>
          <div className={styles.cardSubtitle}>Распределение последних измерений</div>
        </div>
      </div>
      <div className={styles.barList}>
        {counts.map(({ status, count }) => (
          <div key={status} className={styles.barRow}>
            <div className={styles.barLabel}>{statusCopy[status].label}</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${(count / max) * 100}%`,
                  background: statusCopy[status].color,
                }}
              />
            </div>
            <div className={styles.barValue}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
