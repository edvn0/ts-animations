import { Client } from "https://deno.land/x/postgres/mod.ts";


const client = new Client({
	host: Deno.env.get('POSTGRES_HOST') ?? 'localhost',
	port: Number(Deno.env.get('POSTGRES_PORT')) || 5432,
	user: Deno.env.get('POSTGRES_USER') ?? 'postgres',
	password: Deno.env.get('POSTGRES_PASSWORD') ?? 'postgres',
	database: Deno.env.get('POSTGRES_DB') ?? 'postgres',
});

const mapTo = <T>(data: any): T => {
	return data as T;
};

export const query = async<T>(sql: string, params: any[] = []) => {
	await client.connect();
	try {
		const result = await client.queryObject<T>(sql, ...params);
		if (result.rows.length === 0) {
			return null;
		}
		if (result.rows.length === 1) {
			return result.rows[0];
		}
		return result.rows.map(mapTo<T>);
	}
	finally {
		await client.end();
	}
}
