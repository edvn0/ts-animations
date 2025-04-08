import { logError, logInfo } from "../../logger.ts";
import passwordService from "../../services/password.service.ts";
import { IDatabaseService } from "../database.ts";
import { BaseModel } from "./base-model.type.ts";
import { faker } from "npm:@faker-js/faker@9.6.0";
import { TableInitialisationFunction } from "./table-initialisation-function.type.ts";

export type DbUser = BaseModel & {
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

export const createUserTable: TableInitialisationFunction = async (
  db: IDatabaseService,
) => {
  const q = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL
    );
  `;
  await db.queryOne<void>(q);

  const indexQ = `
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
  `;
  await db.queryOne<void>(indexQ);

  const countQ = `
    SELECT COUNT(*) FROM users;
  `;
  const count = await db.queryOne<{ count: number }>(countQ);

  if (count?.count && count.count > 10_000) {
    logInfo(`Users count is ${count.count}, no need to insert more.`);
    return true;
  }

  const batch_size = 2000;
  const total_users = 10_000;

  for (let i = 0; i < total_users; i += batch_size) {
    const current_batch_size = Math.min(batch_size, total_users - i);
    const rows: unknown[][] = [];

    logInfo(
      `Processing batch ${i / batch_size + 1}, users ${i + 1} to ${
        i + current_batch_size
      }`,
    );

    for (let j = 0; j < current_batch_size; j++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName });
      const password = passwordService.hashPassword({
        password: faker.internet.password(),
      });
      rows.push([name, email, password]);
    }

    try {
      await db.insertMany(
        "users",
        ["name", "email", "password"],
        rows,
        "(email) DO NOTHING",
      );
    } catch (err) {
      logError("Batch insert failed", err);
    }

    logInfo(`Completed batch ${i / batch_size + 1}`);
  }

  logInfo(`Completed inserting test users`);

  const myUserQ = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO NOTHING;
  `;

  const myUser = {
    name: "Test Testsson",
    email: "test@test.com",
    password: passwordService.hashPassword({
      password: "password",
    }),
  };

  logInfo(myUser);
  const { name, email, password } = myUser;

  await db.query<{ id: number }>(
    myUserQ,
    [name, email, password],
  );

  logInfo("User table setup complete");

  return true;
};
