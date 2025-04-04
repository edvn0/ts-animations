import { logInfo } from "../../logger.ts";
import passwordService from "../../services/password.service.ts";
import { query, queryOne } from "../database.ts";
import { BaseModel } from "./base-model.type.ts";
import { faker } from "npm:@faker-js/faker@9.6.0";

export type User = BaseModel & {
  email: string;
  password: string;
  name: string;
};

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
  await queryOne<void>({ text: q });

  const indexQ = `
		CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
	`;
  await queryOne<void>({ text: indexQ });

  const countQ = `
		SELECT COUNT(*) FROM users;
	`;
  const count = await queryOne<{ count: number }>({ text: countQ });
  if (count?.count! > 100) {
    logInfo(`Users count is ${count?.count ?? 0}, no need to insert more.`);
    return;
  }

  const insertQ = `
		INSERT INTO users (name, email, password)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO NOTHING;
	`;
  const users = Array.from({ length: 10000 }, async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName });
    const password = await passwordService.hashPassword(
      { password: faker.internet.password() },
    );
    const result = await queryOne<{ id: number }>(
      {
        text: insertQ,
      },
      [name, email, password],
    );
    return result?.id;
  });

  await Promise.all(users);

  // Insert my user!
  const myUserQ = `
		INSERT INTO users (name, email, password)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO NOTHING;
	`;
  const myUser = {
    name: "Test Testsson",
    email: "mytestuser@gmail.com",
    password: await passwordService.hashPassword({
      password: "password",
    }),
  };
  const { name, email, password } = myUser;
  await query<{ id: number }>(
    {
      text: myUserQ,
    },
    [
      name,
      email,
      password,
    ],
  );
}
