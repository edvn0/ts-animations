import { logInfo } from "../logger.ts";
import passwordService from "./password.service.ts";
import { create, Header } from "@zaubrik/djwt";
import { DbUser } from "../database/models/user.model.ts";
import { IDatabaseService } from "../database/database.ts";

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateUserParameters = {
  name?: string;
  email?: string;
  password?: string;
};

// deno-lint-ignore no-explicit-any
const mapKeysTo = <T>(input: Record<string, any>): T[] => {
  const mapTo = (input: string) => {
    return input as T;
  };
  return Object.keys(input).map(mapTo);
};

type EmailPasswordName = "email" | "password" | "name";

export class CouldNotCreateUserError extends Error {
  constructor(message: string, status?: string | undefined) {
    super(!status ? message : `${message} - ${status}`);
    this.name = "CouldNotCreateUserError";
  }
}

class UserService {
  constructor(private readonly db: IDatabaseService) {}

  public async getAllUsers(): Promise<User[]> {
    const users = await this.db.query<User>(
      `SELECT name, email, password, created_at AS createdAt, updated_at AS updatedAt FROM users`,
    );
    if (!users) return [];

    if (Array.isArray(users)) {
      return users;
    } else {
      return [users];
    }
  }

  public async createUser(
    name: string,
    email: string,
    userPassword: string,
  ): Promise<User | null> {
    const q = `
      INSERT INTO users (name, email, password, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE 'UTC', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      RETURNING name, email, password, created_at AS createdAt, updated_at AS updatedAt;
    `;
    const password = passwordService.hashPassword({
      password: userPassword,
    });
    const result = await this.db.query<User>(q, [name, email, password]);
    if (result?.length === 0) {
      throw new CouldNotCreateUserError(
        "User creation failed - no rows returned",
      );
    }
    return result?.at(0) ?? null;
  }

  public async updateUser(
    id: number,
    { name, email, password }: UpdateUserParameters,
  ): Promise<User | null> {
    const fieldsToUpdate: Record<EmailPasswordName, string> = {
      email: email ?? "",
      password: password ?? "",
      name: name ?? "",
    };
    if (
      mapKeysTo<EmailPasswordName>(fieldsToUpdate).every(
        (key) => fieldsToUpdate[key] === "",
      )
    ) {
      throw new Error("No fields to update");
    }
    const setClause = mapKeysTo<EmailPasswordName>(fieldsToUpdate)
      .filter((key) => fieldsToUpdate[key] !== "")
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = Object.values(fieldsToUpdate).filter(
      (value) => value !== "",
    );
    const q = `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length + 1}
      RETURNING name, email, password, created_at AS createdAt, updated_at AS updatedAt;
    `;
    const result = await this.db.query<User>(
      q,
      [...values, id],
    );
    if (result?.length === 0) {
      return null;
    }
    return result?.at(0) ?? null;
  }

  public async getUserById(id: number): Promise<User | null> {
    const q = `
      SELECT id, name, email, password, created_at AS createdAt, updated_at AS updatedAt
      FROM users
      WHERE id = $1;
    `;
    const result = await this.db.query<User>(q, [id]);
    if (result?.length === 0) {
      return null;
    }
    return result?.at(0) ?? null;
  }

  public async deleteUser(id: number): Promise<void> {
    const q = `
      DELETE FROM users
      WHERE id = $1;
    `;
    await this.db.query<void>(q, [id]);
  }

  public async getUserByEmail(email: string): Promise<DbUser | null> {
    const q = `
      SELECT id, name, email, password, created_at AS createdAt, updated_at AS updatedAt
      FROM users
      WHERE email = $1;
    `;
    const result = await this.db.query<DbUser>(q, [email]);
    if (result?.length === 0) {
      return null;
    }
    return result?.at(0) ?? null;
  }

  public async logout(): Promise<void> {
    return await Promise.resolve();
  }

  public async login(email: string, password: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      logInfo("User not found");
      return null;
    }
    const isPasswordValid = passwordService.comparePasswords(
      {
        password,
        hashedPassword: user.password,
      },
    );
    if (!isPasswordValid) {
      return null;
    }

    const JWT_SECRET = Deno.env.get("STATIC_JWT") ?? "dev-secret";

    const roles = await this.db.query<{ name: string }>(
      `
        SELECT r.name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
      `,
      [user.id],
    );

    const header: Header = {
      alg: "HS256",
      typ: "JWT",
    };

    // Convert JWT_SECRET to Uint8Array for djwt
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );

    const now = Math.floor(Date.now() / 1000);
    const token = await create(
      header,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: roles?.map((e) => e.name) ?? [],
        iss: "ts-animations", // issuer
        sub: String(user.id), // subject (typically the user id)
        aud: "consumer", // audience (can be client app name)
        exp: now + 60 * 60 * 24, // 1 day expiration
        nbf: now, // not valid before now
        iat: now, // issued at now
        jti: crypto.randomUUID(), // unique token id
      },
      cryptoKey,
    );

    return token;
  }
}

export { UserService };
