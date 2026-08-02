import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isCloudDb =
  process.env.NODE_ENV === "production" ||
  process.env.DATABASE_URL.includes("supabase") ||
  process.env.DATABASE_URL.includes("neon") ||
  process.env.DATABASE_URL.includes("render") ||
  process.env.DATABASE_URL.includes("sslmode=");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema/index.js";
