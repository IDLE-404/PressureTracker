import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { db } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const parseOrigins = (raw) =>
  raw
    ?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);

app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS measurements (
      id SERIAL PRIMARY KEY,
      systolic SMALLINT NOT NULL CHECK (systolic BETWEEN 40 AND 260),
      diastolic SMALLINT NOT NULL CHECK (diastolic BETWEEN 20 AND 200),
      pulse SMALLINT CHECK (pulse BETWEEN 20 AND 250),
      measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_measurements_measured_at
    ON measurements (measured_at DESC);
  `);
};

const classifyPressure = (systolic, diastolic) => {
  if (systolic >= 180 || diastolic >= 120) return "danger";
  if (systolic >= 160 || diastolic >= 100) return "high";
  if (systolic >= 140 || diastolic >= 90) return "elevated";
  if (systolic >= 120 || diastolic >= 80) return "prehypertension";
  return "normal";
};

const validateMeasurement = (body, { partial = false } = {}) => {
  const errors = [];
  const hasField = (key) => Object.prototype.hasOwnProperty.call(body, key);

  const systolicRaw = body.systolic;
  const diastolicRaw = body.diastolic;
  const pulseRaw = body.pulse;
  const measuredAtRaw = body.measuredAt;

  const result = {};

  if (!partial || hasField("systolic")) {
    const systolic = Number(systolicRaw);
    if (!Number.isFinite(systolic))
      errors.push("systolic must be a number");
    else if (systolic < 40 || systolic > 260)
      errors.push("systolic must be between 40 and 260");
    else result.systolic = systolic;
  }

  if (!partial || hasField("diastolic")) {
    const diastolic = Number(diastolicRaw);
    if (!Number.isFinite(diastolic))
      errors.push("diastolic must be a number");
    else if (diastolic < 20 || diastolic > 200)
      errors.push("diastolic must be between 20 and 200");
    else result.diastolic = diastolic;
  }

  if (hasField("pulse")) {
    if (pulseRaw === null || pulseRaw === undefined || pulseRaw === "")
      result.pulse = null;
    else {
      const pulse = Number(pulseRaw);
      if (!Number.isFinite(pulse))
        errors.push("pulse must be a number");
      else if (pulse < 20 || pulse > 250)
        errors.push("pulse must be between 20 and 250");
      else result.pulse = pulse;
    }
  }

  if (hasField("measuredAt")) {
    const measuredAt = new Date(measuredAtRaw);
    if (Number.isNaN(measuredAt.getTime()))
      errors.push("measuredAt must be a valid date");
    else result.measuredAt = measuredAt.toISOString();
  } else if (!partial) {
    result.measuredAt = new Date().toISOString();
  }

  return { errors, data: result };
};

const serializeMeasurement = (row) => ({
  id: row.id,
  systolic: row.systolic,
  diastolic: row.diastolic,
  pulse: row.pulse,
  measuredAt: new Date(row.measured_at || row.measuredat).toISOString(),
  status: classifyPressure(row.systolic, row.diastolic),
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/measurements", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const result = await db.query(
      `
        SELECT id, systolic, diastolic, pulse, measured_at
        FROM measurements
        ORDER BY measured_at DESC
        LIMIT $1
      `,
      [limit]
    );
    res.json(result.rows.map(serializeMeasurement));
  } catch (err) {
    next(err);
  }
});

app.get("/api/measurements/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `
        SELECT id, systolic, diastolic, pulse, measured_at
        FROM measurements
        WHERE id = $1
      `,
      [id]
    );

    if (!result.rowCount) return res.status(404).json({ error: "Not found" });
    res.json(serializeMeasurement(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

app.post("/api/measurements", async (req, res, next) => {
  try {
    const { data, errors } = validateMeasurement(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const result = await db.query(
      `
        INSERT INTO measurements (systolic, diastolic, pulse, measured_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, systolic, diastolic, pulse, measured_at
      `,
      [data.systolic, data.diastolic, data.pulse, data.measuredAt]
    );

    res.status(201).json(serializeMeasurement(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

app.patch("/api/measurements/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, errors } = validateMeasurement(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });
    if (!Object.keys(data).length)
      return res.status(400).json({ error: "No fields to update" });

    const fields = [];
    const values = [];
    let idx = 1;

    if (data.systolic !== undefined) {
      fields.push(`systolic = $${idx++}`);
      values.push(data.systolic);
    }
    if (data.diastolic !== undefined) {
      fields.push(`diastolic = $${idx++}`);
      values.push(data.diastolic);
    }
    if (data.pulse !== undefined) {
      fields.push(`pulse = $${idx++}`);
      values.push(data.pulse);
    }
    if (data.measuredAt !== undefined) {
      fields.push(`measured_at = $${idx++}`);
      values.push(data.measuredAt);
    }

    fields.push(`updated_at = now()`);

    const result = await db.query(
      `
        UPDATE measurements
        SET ${fields.join(", ")}
        WHERE id = $${idx}
        RETURNING id, systolic, diastolic, pulse, measured_at
      `,
      [...values, id]
    );

    if (!result.rowCount) return res.status(404).json({ error: "Not found" });
    res.json(serializeMeasurement(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

app.delete("/api/measurements/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `DELETE FROM measurements WHERE id = $1`,
      [id]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.get("/api/stats/summary", async (req, res, next) => {
  try {
    const range = ["day", "week", "month"].includes(req.query.range)
      ? req.query.range
      : "day";
    const limit = Math.min(Number(req.query.limit) || 30, 180);

    const result = await db.query(
      `
        SELECT
          date_trunc($1, measured_at) AS bucket,
          COUNT(*) AS count,
          AVG(systolic)::numeric(6,2) AS avg_systolic,
          AVG(diastolic)::numeric(6,2) AS avg_diastolic,
          AVG(pulse)::numeric(6,2) AS avg_pulse,
          MIN(systolic) AS min_systolic,
          MAX(systolic) AS max_systolic,
          MIN(diastolic) AS min_diastolic,
          MAX(diastolic) AS max_diastolic
        FROM measurements
        GROUP BY bucket
        ORDER BY bucket DESC
        LIMIT $2
      `,
      [range, limit]
    );

    const data = result.rows.map((row) => ({
      bucket: new Date(row.bucket).toISOString(),
      count: Number(row.count),
      avgSystolic: Number(row.avg_systolic),
      avgDiastolic: Number(row.avg_diastolic),
      avgPulse: row.avg_pulse !== null ? Number(row.avg_pulse) : null,
      minSystolic: Number(row.min_systolic),
      maxSystolic: Number(row.max_systolic),
      minDiastolic: Number(row.min_diastolic),
      maxDiastolic: Number(row.max_diastolic),
    }));

    res.json({ range, data });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res
    .status(500)
    .json({ error: "Internal server error", details: err.message ?? err });
});

const start = async () => {
  try {
    await ensureTables();
    await db.query("SELECT 1"); // sanity check connection
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
