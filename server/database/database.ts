import { ClientOptions, Pool, PoolClient } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { delay } from "https://deno.land/std@0.224.0/async/delay.ts";
import { logError, logInfo } from "../logger.ts";

export const closePool = async (
  databaseService: IDatabaseService,
): Promise<void> => {
  await databaseService.close();
  logInfo("Pool closed");
};

export interface IDatabaseService {
  query<T>(text: string, params: unknown[]): Promise<T[] | null>;
  query<T>(text: string): Promise<T[] | null>;
  queryOne<T>(text: string, params: unknown[]): Promise<T | null>;
  queryOne<T>(text: string): Promise<T | null>;
  insertMany(
    table: string,
    columns: string[],
    rows: unknown[][],
    on_conflict?: string,
  ): Promise<void>;
  close(): Promise<void>;
}

export class DatabaseService implements IDatabaseService {
  private readonly pool: Pool;

  constructor() {
    const config: ClientOptions = {
      hostname: Deno.env.get("POSTGRES_HOST") ?? "postgres",
      port: Number(Deno.env.get("POSTGRES_PORT") ?? 5432),
      user: Deno.env.get("POSTGRES_USER") ?? "postgres",
      password: Deno.env.get("POSTGRES_PASSWORD") ?? "postgres",
      database: Deno.env.get("POSTGRES_DB") ?? "postgres",
    };
    this.pool = new Pool(config, 20, true);
    logInfo({ msg: "DB Pool initialized", config });
  }

  private async getClient(): Promise<PoolClient> {
    while (true) {
      try {
        return await this.pool.connect();
      } catch (err) {
        logError("Failed to get client", err);
        await delay(160);
      }
    }
  }

  public async query<T>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[] | null> {
    const client = await this.getClient();
    try {
      const result = await client.queryObject<T>(text, params);
      return result.rows.length > 0 ? result.rows : null;
    } finally {
      client.release();
    }
  }

  public async queryOne<T>(
    text: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const client = await this.getClient();
    try {
      const result = await client.queryObject<T>(text, params);
      if (result.rows.length === 1) return result.rows[0];
      if (result.rows.length > 1) throw new Error("Expected one row");
      return null;
    } finally {
      client.release();
    }
  }

  public async insertMany(
    table: string,
    columns: string[],
    rows: unknown[][],
    on_conflict?: string,
  ): Promise<void> {
    if (rows.length === 0) return;

    const placeholders: string[] = [];
    const values: unknown[] = [];

    rows.forEach((row, i) => {
      const p = row.map((_, j) => `$${i * columns.length + j + 1}`);
      placeholders.push(`(${p.join(", ")})`);
      values.push(...row);
    });

    let text = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`;
    if (on_conflict) text += ` ON CONFLICT ${on_conflict}`;

    const client = await this.getClient();
    try {
      await client.queryArray(text, values);
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
