import type { MeasurementStatsPoint } from "@/domain/entities/measurement/MeasurementStats";
import type { StatsRange } from "@/domain/entities/measurement/MeasurementStats";
import styles from "../Home.module.css";

interface Props {
  data: MeasurementStatsPoint[];
  range: StatsRange;
}

const formatBucketLabel = (range: StatsRange, iso: string) => {
  const date = new Date(iso);
  if (range === "month") {
    return date.toLocaleString("ru-RU", { month: "short", year: "2-digit" });
  }
  if (range === "week") {
    const end = new Date(date);
    end.setDate(date.getDate() + 6);
    const startStr = date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
    const endStr = end.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
    return `${startStr}—${endStr}`;
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
};

const buildPath = (values: number[], width: number, height: number, maxValue: number) => {
  if (!values.length) return "";
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const safeMax = Math.max(maxValue, 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - (v / safeMax) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export const TrendChart = ({ data, range }: Props) => {
  if (!data.length) {
    return <div className={styles.chartEmpty}>Недостаточно данных для графика</div>;
  }

  const width = Math.max(480, (data.length - 1) * 110 + 120);
  const height = 220;

  const sysValues = data.map((d) => d.avgSystolic);
  const diaValues = data.map((d) => d.avgDiastolic);
  const maxValue = Math.max(...sysValues, ...diaValues, 1);

  const systolicPath = buildPath(sysValues, width, height, maxValue * 1.05);
  const diastolicPath = buildPath(diaValues, width, height, maxValue * 1.05);

  const areaPath =
    systolicPath &&
    `${systolicPath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <div className={styles.cardTitle}>График давления</div>
          <div className={styles.cardSubtitle}>Средние значения по выбранному диапазону</div>
        </div>
        <div className={styles.chartLegend}>
          <span className={styles.legendDot} style={{ background: "var(--accent)" }} /> Систолическое
          <span className={styles.legendDot} style={{ background: "#7c91ff" }} /> Диастолическое
        </div>
      </div>

      <div className={styles.chartScroll}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="График среднего давления"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" stroke="none" vectorEffect="non-scaling-stroke" />
          )}

          {diastolicPath && (
            <path
              d={diastolicPath}
              fill="none"
              stroke="#7c91ff"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {systolicPath && (
            <path
              d={systolicPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={4}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {data.map((point, i) => {
            const stepX = data.length > 1 ? width / (data.length - 1) : width;
            const x = i * stepX;
            const ySys = height - (point.avgSystolic / (maxValue * 1.05)) * height;
            const yDia = height - (point.avgDiastolic / (maxValue * 1.05)) * height;

            return (
              <g key={point.bucket}>
                <circle cx={x} cy={ySys} r={5} fill="var(--accent)" />
                <circle cx={x} cy={yDia} r={4} fill="#7c91ff" />
                <text
                  x={x}
                  y={height + 18}
                  textAnchor="middle"
                  className={styles.chartLabel}
                >
                  {formatBucketLabel(range, point.bucket)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
