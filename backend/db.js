import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;

dotenv.config();

export const db = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "pressure_tracker",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 5432,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

db.on("error", (err) => {
  console.error("Postgres connection error", err);
});
