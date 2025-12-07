import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { MeasurementEntity } from "@/domain/entities/measurement/MeasurementEntity";
import type { MeasurementStatsPoint, StatsRange } from "@/domain/entities/measurement/MeasurementStats";
import styles from "../Home.module.css";

interface Props {
  data: MeasurementStatsPoint[];
  range: StatsRange;
  measurements?: MeasurementEntity[];
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

const statusPalette: Record<
  MeasurementEntity["status"],
  { fill: string; stroke: string }
> = {
  normal: { fill: "#2E6B45", stroke: "#39D17A" },
  prehypertension: { fill: "#284A63", stroke: "#5CA9D9" },
  elevated: { fill: "#4A423C", stroke: "#D6B354" },
  high: { fill: "#4A272A", stroke: "#D15B5B" },
  danger: { fill: "#4A3B66", stroke: "#B38BFF" },
};

const fallbackPalette = [
  { fill: "#2E6B45", stroke: "#39D17A" },
  { fill: "#284A63", stroke: "#5CA9D9" },
  { fill: "#4A423C", stroke: "#D6B354" },
  { fill: "#4A272A", stroke: "#D15B5B" },
  { fill: "#4A3B66", stroke: "#B38BFF" },
];

export const TrendChart = ({ data, range, measurements }: Props) => {
  if (!data.length) {
    return <div className={styles.chartEmpty}>Недостаточно данных для графика</div>;
  }

  const hasMeasurements = Boolean(measurements?.length);

  const chartData = hasMeasurements
    ? [...(measurements ?? [])]
        .sort(
          (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
        )
        .map((m) => {
          const colors = statusPalette[m.status];
          return {
            label: new Date(m.measuredAt).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            value: m.systolic,
            diastolic: m.diastolic,
            pulse: m.pulse,
            status: m.status,
            fill: colors.fill,
            stroke: colors.stroke,
            isMeasurement: true,
          };
        })
    : [...data]
        .sort(
          (a, b) => new Date(a.bucket).getTime() - new Date(b.bucket).getTime()
        )
        .map((item, idx) => ({
          label: formatBucketLabel(range, item.bucket),
          value: Number(item.avgSystolic),
          diastolic: Number(item.avgDiastolic),
          isMeasurement: false,
          fill: fallbackPalette[idx % fallbackPalette.length].fill,
          stroke: fallbackPalette[idx % fallbackPalette.length].stroke,
        }));

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <div className={styles.cardTitle}>График давления</div>
          <div className={styles.cardSubtitle}>
            Ступенчатые бар-сегменты + волнистая линия
          </div>
        </div>
      </div>

      <div className={styles.chartScroll}>
        <div className={styles.chartFrame}>
          <ResponsiveContainer width="100%" aspect={16 / 5}>
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 16, left: 16, bottom: 24 }}
            >
              <CartesianGrid vertical={false} stroke="#2b323b" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8fa1b7", fontSize: 11 }}
                axisLine={{ stroke: "#2b323b" }}
                tickLine={{ stroke: "#2b323b" }}
                interval={0}
              />
              <YAxis
                tick={{ fill: "#8fa1b7", fontSize: 11 }}
                axisLine={{ stroke: "#2b323b" }}
                tickLine={{ stroke: "#2b323b" }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f242b",
                  border: "1px solid #2b323b",
                  borderRadius: 8,
                  color: "#e8edf3",
                }}
                labelStyle={{ color: "#e8edf3" }}
                formatter={(val: number, _name: string, props) => {
                  const payload = props?.payload as (typeof chartData)[number];
                  if (payload?.isMeasurement) {
                    return [
                      `${val.toFixed(0)} / ${payload.diastolic} мм рт. ст.`,
                      "Измерение",
                    ];
                  }
                  return [`${val.toFixed(1)} мм рт. ст.`, "Среднее"];
                }}
              />
              <Bar dataKey="value" barSize={28} radius={[2, 2, 2, 2]} strokeWidth={2}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke={entry.stroke}
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
