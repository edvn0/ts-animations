import { Client, Query, ResultIterator } from "ts-postgres";
import { pool } from "./connect-database";

export async function query<Output>(
  q: Query,
  values?: any[],
  retries = 5,
): Promise<ResultIterator<Output>> {
  try {
    return await pool.use(async (client: Client) => {
      const result = await client.query<Output>(q, values);
      return result;
    });
  } catch (e) {
    if (retries > 0) return query<Output>(q, values, retries - 1);
    throw e;
  }
}

export async function queryOne<Output>(
  q: Query,
  values?: any[],
  retries = 5,
): Promise<Output | null> {
  try {
    const result = await query<Output>(q, values);
    if (result.rows.length === 0) return null;
    return result.rows[0]?.reify() ?? null;
  } catch (e) {
    if (retries > 0) return queryOne<Output>(q, values, retries - 1);
    throw e;
  }
}
