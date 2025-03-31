import { userSelect } from "../db/models/user.model";
import { query } from "../db/queries";
import passwordService from "./password.service";

export type User = {
	id: number
	name: string
	email: string
	password: string
	createdAt: Date
	updatedAt: Date
};

export type UpdateUserParameters = {
	name?: string
	email?: string
	password?: string
};

export class UserService {
	public async getAllUsers(): Promise<User[]> {
		const users = await query<User>({ text: `SELECT ${userSelect} FROM users` });
		if (users.rows.length === 0) {
			return [];
		}
		return users.rows.map((user) => user.reify());
	}

	public async createUser(name: string, email: string, userPassword: string): Promise<User> {
		const q = `
			INSERT INTO users (name, email, password, created_at, updated_at)
			VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE 'UTC', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
			RETURNING ${userSelect};
		`;
		const password = await passwordService.hashPassword(userPassword);
		const result = await query<User>({ text: q }, [name, email, password]);
		if (result.rows.length === 0) {
			throw new Error("User creation failed");
		}
		return result.rows[0].reify();
	}

	public async updateUser(id: number, updatableParameters: UpdateUserParameters): Promise<User | null> {
		const { name, email, password } = updatableParameters;
		const fieldsToUpdate: Record<string, string> = {};
		if (name) fieldsToUpdate.name = name;
		if (email) fieldsToUpdate.email = email;
		if (password) fieldsToUpdate.password = await passwordService.hashPassword(password);
		if (Object.keys(fieldsToUpdate).length === 0) {
			throw new Error("No fields to update");
		}
		const setClause = Object.keys(fieldsToUpdate)
			.map((key, index) => `${key} = $${index + 1}`)
			.join(", ");
		const values = Object.values(fieldsToUpdate);
		const q = `
			UPDATE users
			SET ${setClause}, updated_at = CURRENT_TIMESTAMP
			WHERE id = $${values.length + 1}
			RETURNING ${userSelect};
		`;
		const result = await query<User>({ text: q }, [...values, id]);
		if (result.rows.length === 0) {
			return null;
		}
		return result.rows[0].reify();
	}

	public async getUserById(id: number): Promise<User | null> {
		const q = `
			SELECT ${userSelect}
			FROM users
			WHERE id = $1;
		`;
		const result = await query<User>({ text: q }, [id]);
		if (result.rows.length === 0) {
			return null;
		}
		return result.rows[0].reify();
	}

	public async deleteUser(id: number): Promise<void> {
		const q = `
			DELETE FROM users
			WHERE id = $1;
		`;
		await query<void>({ text: q }, [id]);
	}

	public async getUserByEmail(email: string): Promise<User | null> {
		const q = `
			SELECT ${userSelect}
			FROM users
			WHERE email = $1;
		`;
		const result = await query<User>({ text: q }, [email]);
		if (result.rows.length === 0) {
			return null;
		}
		return result.rows[0].reify();
	}

	public async login(email: string, password: string): Promise<User | null> {
		const user = await this.getUserByEmail(email);
		if (!user) {
			return null;
		}
		const isPasswordValid = await passwordService.comparePassword(password, user.password);
		if (!isPasswordValid) {
			return null;
		}
		return user;
	}
}

export default new UserService();
