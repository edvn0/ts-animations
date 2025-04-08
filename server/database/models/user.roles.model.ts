import { IDatabaseService } from "../database.ts";
import { BaseModel } from "./base-model.type.ts";
import { logError, logInfo } from "../../logger.ts";
import { wait } from "../../functions/promisified.ts";
import { TableInitialisationFunction } from "./table-initialisation-function.type.ts";

export type Role = BaseModel & {
  name: string;
};

export type UserRole = BaseModel & {
  userId: number;
  roleId: number;
};

export const UserRoleName = {
  user: "user",
  admin: "admin",
  moderator: "moderator",
  editor: "editor",
  viewer: "viewer",
} as const;

export type UserRoleName = (typeof UserRoleName)[keyof typeof UserRoleName];
export const roleNames: UserRoleName[] = Object.values(UserRoleName);

export function roleToDatabaseValue(role: UserRoleName): string {
  return role;
}

export const createUserRolesTables: TableInitialisationFunction = async (
  db: IDatabaseService,
): Promise<boolean> => {
  try {
    logInfo("Starting user roles tables setup");

    const roleQ = `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL
      );
    `;
    await db.query<void>(roleQ);
    logInfo("Roles table created");

    const userRoleQ = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL
      );
    `;
    await db.query<void>(userRoleQ);
    logInfo("User roles table created");

    const indexQ = `
      CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_idx
      ON user_roles (user_id, role_id);
    `;
    await db.query<void>(indexQ);
    logInfo("Unique index created");

    const placeholders = roleNames.map((_, i) => `($${i + 1})`).join(",");
    const defaultRolesQ = `
      INSERT INTO roles (name)
      VALUES ${placeholders}
      ON CONFLICT (name) DO NOTHING;
    `;
    await db.query<void>(
      defaultRolesQ,
      roleNames.map(roleToDatabaseValue),
    );
    logInfo("Default roles inserted");

    const batchSize = 500;
    const assignRandomRolesBatchQ = `
      WITH random_users AS (
        SELECT u.id AS user_id, r.id AS role_id
        FROM users u
        CROSS JOIN (SELECT id FROM roles WHERE name = $1) r
        WHERE NOT EXISTS (
          SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
        )
        ORDER BY RANDOM()
        LIMIT $2
      )
      INSERT INTO user_roles (user_id, role_id)
      SELECT user_id, role_id FROM random_users
      ON CONFLICT DO NOTHING;
    `;

    for (const role of roleNames) {
      const targetAssignments = Math.floor(Math.random() * 5000) + 500;
      let totalAssigned = 0;

      logInfo(`Starting assignments for role: ${role}`);

      // Process in batches
      while (totalAssigned < targetAssignments) {
        const currentBatchSize = Math.min(
          batchSize,
          targetAssignments - totalAssigned,
        );

        try {
          await db.query<void>(
            assignRandomRolesBatchQ,
            [roleToDatabaseValue(role), currentBatchSize],
          );

          totalAssigned += currentBatchSize;
          logInfo(
            `Assigned ${totalAssigned}/${targetAssignments} ${role} roles`,
          );
        } catch (err) {
          logError(`Error assigning ${role} roles`, err);
        }

        await wait(200);
      }

      logInfo(`Completed assignments for role: ${role}`);
    }

    const assignAdminQ = `
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u
      JOIN roles r ON r.name = 'admin'
      WHERE u.email = 'test@test.com'
      AND NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = u.id
        AND ur.role_id = r.id
      );
    `;

    await db.query<void>(assignAdminQ);
    logInfo("Admin role assigned to test user");

    logInfo("User roles tables setup completed successfully");
  } catch (error) {
    logError("Failed to set up user roles tables", error);
    throw error;
  }

  return true;
};
