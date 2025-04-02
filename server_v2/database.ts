import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { logInfo } from "./logger.ts";

const POOL_CONNECTIONS = 20;

const pool = new Pool({
  hostname: Deno.env.get("POSTGRES_HOST") ?? "localhost",
  port: Number(Deno.env.get("POSTGRES_PORT")) || 5432,
  user: Deno.env.get("POSTGRES_USER") ?? "postgres",
  password: Deno.env.get("POSTGRES_PASSWORD") ?? "postgres",
  database: Deno.env.get("POSTGRES_DB") ?? "postgres",
}, POOL_CONNECTIONS);

logInfo({
  POSTGRES_HOST: Deno.env.get("POSTGRES_HOST") ?? "localhost",
  POSTGRES_PORT: Number(Deno.env.get("POSTGRES_PORT")) || 5432,
  POSTGRES_USER: Deno.env.get("POSTGRES_USER") ?? "postgres",
  POSTGRES_PASSWORD: Deno.env.get("POSTGRES_PASSWORD") ?? "postgres",
  POSTGRES_DB: Deno.env.get("POSTGRES_DB") ?? "postgres",
  POOL_CONNECTIONS,
});

export type Query = {
  text: string;
};

export const query = async <T>(
  { text }: Query,
  params: any[] = [],
): Promise<T[] | null> => {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<T>(text, ...params);
    if (result.rows.length === 0) {
      return null;
    }
    if (result.rows.length === 1) {
      return [result.rows[0]];
    }
    return result.rows;
  } finally {
    client.release();
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
  logInfo("Pool closed");
};
