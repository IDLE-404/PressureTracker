import { useState } from "react";
import {
  useCreateMeasurement,
  useDeleteMeasurement,
  useMeasurementsQuery,
  useStatsQuery,
} from "@/data/hook/measurement/useMeasurements";
import type { MeasurementStatus } from "@/domain/entities/measurement/MeasurementEntity";
import type { StatsRange } from "@/domain/entities/measurement/MeasurementStats";
import { TrendChart } from "./components/TrendChart";
import { StatusBarChart } from "./components/StatusBarChart";
import styles from "./Home.module.css";

const statusCopy: Record<
  MeasurementStatus,
  { label: string; description: string; tone: string }
> = {
  normal: { label: "Норма", description: "Оптимальный диапазон", tone: "#2dd4bf" },
  prehypertension: {
    label: "Повышенное",
    description: "Контролируйте тенденцию",
    tone: "#22c55e",
  },
  elevated: {
    label: "Высокое",
    description: "Есть риск, обсудите с врачом",
    tone: "#f59e0b",
  },
  high: { label: "Очень высокое", description: "Нужен контроль", tone: "#fb923c" },
  danger: {
    label: "Опасно",
    description: "Требуется срочная проверка",
    tone: "#ef4444",
  },
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatBucket = (range: StatsRange, iso: string) => {
  const date = new Date(iso);
  if (range === "month") {
    return date.toLocaleString("ru-RU", { month: "long", year: "numeric" });
  }
  if (range === "week") {
    const end = new Date(date);
    end.setDate(date.getDate() + 6);
    const startStr = date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
    const endStr = end.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
    return `Неделя: ${startStr} — ${endStr}`;
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
};

const toLocalInputValue = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const Home = () => {
  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    measuredAt: toLocalInputValue(new Date()),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [statsRange, setStatsRange] = useState<StatsRange>("day");

  const measurementsQuery = useMeasurementsQuery(60);
  const statsQuery = useStatsQuery(statsRange, 30);
  const createMutation = useCreateMeasurement();
  const deleteMutation = useDeleteMeasurement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    const pulse = form.pulse ? Number(form.pulse) : null;

    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) {
      setFormError("Введите числа для систолического и диастолического давления");
      return;
    }

    const measuredAtIso = form.measuredAt
      ? new Date(form.measuredAt).toISOString()
      : new Date().toISOString();

    try {
      await createMutation.mutateAsync({
        systolic,
        diastolic,
        pulse: pulse ?? undefined,
        measuredAt: measuredAtIso,
      });
      setForm({
        systolic: "",
        diastolic: "",
        pulse: "",
        measuredAt: toLocalInputValue(new Date()),
      });
    } catch (err) {
      console.error(err);
      setFormError("Не удалось сохранить измерение. Попробуйте ещё раз.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить измерение?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить запись.");
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.card} id="stats-section">
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Статистика</div>
            <div className={styles.cardSubtitle}>
              График средних значений + разбивка по статусам
            </div>
          </div>
          <div className={styles.statsControls}>
            {(["day", "week", "month"] as StatsRange[]).map((range) => (
              <button
                key={range}
                className={`${styles.chip} ${
                  statsRange === range ? styles.chipActive : ""
                }`}
                onClick={() => setStatsRange(range)}
              >
                {range === "day" ? "Дни" : range === "week" ? "Недели" : "Месяцы"}
              </button>
            ))}
          </div>
        </div>

        {statsQuery.isLoading && <div className={styles.cardSubtitle}>Готовим данные...</div>}
        {statsQuery.error && <div className={styles.error}>Не удалось загрузить статистику</div>}

        {statsQuery.data && (
          <TrendChart data={statsQuery.data.data} range={statsRange} />
        )}

        {measurementsQuery.data && (
          <StatusBarChart measurements={measurementsQuery.data} />
        )}

        <div className={styles.statsGrid}>
          {statsQuery.data?.data.map((point) => (
            <div key={point.bucket} className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statLabel}>{formatBucket(statsRange, point.bucket)}</div>
                <div className={styles.pill}>{point.count} зам.</div>
              </div>
              <div className={styles.statValue}>
                {point.avgSystolic.toFixed(1)}/{point.avgDiastolic.toFixed(1)}
              </div>
              <div className={styles.statMeta}>
                <span>мин {point.minSystolic}/{point.minDiastolic}</span>
                <span>макс {point.maxSystolic}/{point.maxDiastolic}</span>
              </div>
              <div className={styles.cardSubtitle}>
                Пульс: {point.avgPulse !== null ? point.avgPulse.toFixed(1) : "—"}
              </div>
            </div>
          ))}
          {!statsQuery.isLoading && (statsQuery.data?.data.length ?? 0) === 0 && (
            <div className={styles.empty}>Недостаточно данных для статистики.</div>
          )}
        </div>
      </section>

      <div className={styles.grid}>
        <section className={styles.card} id="add-section">
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Новое измерение</div>
              <div className={styles.cardSubtitle}>Сохраните давление и пульс</div>
            </div>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <label className={styles.label}>
                Систолическое (верхнее)
                <input
                  className={styles.input}
                  type="number"
                  name="systolic"
                  min={40}
                  max={260}
                  value={form.systolic}
                  onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                  placeholder="Например, 120"
                  required
                />
                <span className={styles.helper}>40–260 мм рт. ст.</span>
              </label>
              <label className={styles.label}>
                Диастолическое (нижнее)
                <input
                  className={styles.input}
                  type="number"
                  name="diastolic"
                  min={20}
                  max={200}
                  value={form.diastolic}
                  onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                  placeholder="Например, 80"
                  required
                />
                <span className={styles.helper}>20–200 мм рт. ст.</span>
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>
                Пульс (опционально)
                <input
                  className={styles.input}
                  type="number"
                  name="pulse"
                  min={20}
                  max={250}
                  value={form.pulse}
                  onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                  placeholder="Например, 70"
                />
                <span className={styles.helper}>20–250 уд/мин</span>
              </label>
              <label className={styles.label}>
                Дата и время
                <input
                  className={styles.input}
                  type="datetime-local"
                  name="measuredAt"
                  value={form.measuredAt}
                  onChange={(e) => setForm({ ...form, measuredAt: e.target.value })}
                />
              </label>
            </div>
            {formError && <div className={styles.error}>{formError}</div>}
            <button className={styles.button} type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Сохраняем..." : "Сохранить измерение"}
            </button>
          </form>
        </section>

        <section className={styles.card} id="history-section">
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>История</div>
              <div className={styles.cardSubtitle}>Последние 60 записей</div>
            </div>
            <div className={styles.legend}>
              {Object.entries(statusCopy).map(([key, value]) => (
                <span className={styles.legendItem} key={key}>
                  <span className={styles.dot} style={{ background: value.tone }} />
                  {value.label}
                </span>
              ))}
            </div>
          </div>

          {measurementsQuery.isLoading && <div className={styles.cardSubtitle}>Загружаем...</div>}
          {measurementsQuery.error && (
            <div className={styles.error}>Не удалось загрузить историю</div>
          )}

          <div className={styles.list}>
            {!measurementsQuery.isLoading &&
              measurementsQuery.data?.map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <div className={styles.listMain}>
                    <div className={styles.listTitle}>
                      {item.systolic}/{item.diastolic}
                      <span className={`${styles.status} ${styles[`status_${item.status}`]}`}>
                        {statusCopy[item.status].label}
                      </span>
                    </div>
                    <div className={styles.listMeta}>
                      <span>{formatDateTime(item.measuredAt)}</span>
                      <span className={styles.pill}>
                        Пульс: {item.pulse ? `${item.pulse} уд/мин` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.ghostButton} onClick={() => handleDelete(item.id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            {!measurementsQuery.isLoading && (measurementsQuery.data?.length ?? 0) === 0 && (
              <div className={styles.empty}>Ещё нет измерений — добавьте первое.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

Home.route = {
  path: "/",
};

export default Home;
