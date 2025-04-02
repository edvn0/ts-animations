import { query } from "../queries";
import { BaseModel } from "./base.model";

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

export async function createUserRolesTables(): Promise<void> {
  const roleQ = `
		CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) UNIQUE NOT NULL,
			created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL,
			updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL
		);
	`;
  await query<void>({ text: roleQ });

  const userRoleQ = `
		CREATE TABLE IF NOT EXISTS user_roles (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') NOT NULL
		);
	`;
  await query<void>({ text: userRoleQ });

  const indexQ = `
		CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_idx
		ON user_roles (user_id, role_id);
	`;
  await query<void>({ text: indexQ });

  const placeholders = roleNames.map((_, i) => `($${i + 1})`).join(",");
  const defaultRolesQ = `
		INSERT INTO roles (name)
		VALUES ${placeholders}
		ON CONFLICT (name) DO NOTHING;
	`;
  await query<void>(
    {
      text: defaultRolesQ,
    },
    roleNames.map(roleToDatabaseValue),
  );

  const assignRandomRolesQ = `
	INSERT INTO user_roles (user_id, role_id)
	SELECT u.id, r.id
	FROM users u
	JOIN roles r ON r.name = $1
	WHERE NOT EXISTS (
		SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
	)
	ORDER BY RANDOM()
	LIMIT $2;
`;

  for (const role of roleNames) {
    const numAssignments = Math.floor(Math.random() * 5000) + 500;
    await query<void>(
      {
        text: assignRandomRolesQ,
      },
      [roleToDatabaseValue(role), numAssignments],
    );
  }

  const assignAdminQ = `
	INSERT INTO user_roles (user_id, role_id)
	SELECT u.id, r.id
	FROM users u
	JOIN roles r ON r.name = 'admin'
	WHERE u.email = 'mytestuser@gmail.com'
	ON CONFLICT DO NOTHING;
`;
  await query<void>({ text: assignAdminQ });
}
