import { faker } from '@faker-js/faker';
import { query } from '../queries';

export interface User {
	id: number
	name: string
	email: string
	password: string
	createdAt: Date
	updatedAt: Date
}

export const userSelect = `
	id,
	name,
	email,
	password,
	created_at AS "createdAt",
	updated_at AS "updatedAt"
`;

export async function createUserTable(): Promise<void> {
	const q = `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL,
			-- Use CURRENT_TIMESTAMP to set the default value for updated_at
			updated_at TIMESTAMPTZ  DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL
		);
	`;
	await query<void>({ text: q });

	const indexQ = `
		CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
	`;
	await query<void>({ text: indexQ });

	const countQ = `
		SELECT COUNT(*) FROM users;
	`;
	const { rows } = await query<{ count: number }>({ text: countQ });
	const count = rows[0].reify().count;
	if (count > 100) {
		console.log(`Users count is ${count}, no need to insert more.`);
		return;
	}

	const insertQ = `
		INSERT INTO users (name, email, password)
		SELECT $1, $2, $3
		ON CONFLICT (email) DO NOTHING;
	`;
	const users = Array.from({ length: 10000 }, () => ({
		name: faker.person.fullName(),
		email: faker.internet.email(),
		password: faker.internet.password(),
	})).map((user) => query<{ id: number }>({
		text: insertQ,
	}, [user.name, user.email, user.password]));

	await Promise.all(users);
}
