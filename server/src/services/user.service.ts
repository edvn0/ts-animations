import { userSelect } from '../db/models/user.model'
import { query } from '../db/queries'
import { logInfo } from '../logger'
import passwordService from './password.service'
import { sign } from 'jsonwebtoken'

export type User = {
	id: number
	name: string
	email: string
	password: string
	createdAt: Date
	updatedAt: Date
}

export type UpdateUserParameters = {
	name?: string
	email?: string
	password?: string
}

const mapKeysTo = <T, V = any>(input: Record<string, V>): T[] => {
	const mapTo = (input: string) => {
		return input as T;
	};
	return Object.keys(input).map(mapTo);
};

type EmailPasswordName = 'email' | 'password' | 'name'

export class CouldNotCreateUserError extends Error {
	constructor(message: string, status: string | undefined) {
		super(!status ? message : `${message} - ${status}`);
		this.name = 'CouldNotCreateUserError'
	}
}

export class UserService {
	public async getAllUsers(): Promise<User[]> {
		const users = await query<User>({ text: `SELECT ${userSelect} FROM users` })
		return users.rows.map((user) => user.reify())
	}

	public async createUser(name: string, email: string, userPassword: string): Promise<User | null> {
		const q = `
			INSERT INTO users (name, email, password, created_at, updated_at)
			VALUES ($1, $2, $3, CURRENT_TIMESTAMP AT TIME ZONE 'UTC', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
			RETURNING ${userSelect};
		`
		const password = await passwordService.hashPassword(userPassword)
		const result = await query<User>({ text: q }, [name, email, password])
		if (result.rows.length === 0) {
			throw new CouldNotCreateUserError("User creation failed - no rows returned", result.status!);
		}
		return result.rows[0]?.reify() ?? null
	}

	public async updateUser(
		id: number,
		updatableParameters: UpdateUserParameters
	): Promise<User | null> {
		const { name, email, password } = updatableParameters
		const fieldsToUpdate: Record<EmailPasswordName, string> = {
			email: email ?? '',
			password: password ?? '',
			name: name ?? '',
		}
		if (
			mapKeysTo<EmailPasswordName>(fieldsToUpdate).every((key) => fieldsToUpdate[key] === '')
		) {
			throw new Error('No fields to update')
		}
		const setClause = mapKeysTo<EmailPasswordName>(fieldsToUpdate)
			.filter((key) => fieldsToUpdate[key] !== '')
			.map((key, index) => `${key} = $${index + 1}`)
			.join(', ')
		const values = Object.values(fieldsToUpdate).filter((value) => value !== '')
		const q = `
			UPDATE users
			SET ${setClause}, updated_at = CURRENT_TIMESTAMP
			WHERE id = $${values.length + 1}
			RETURNING ${userSelect};
		`
		const result = await query<User>({ text: q }, [...values, id])
		if (result.rows.length === 0) {
			return null
		}
		return result.rows[0]?.reify() ?? null
	}

	public async getUserById(id: number): Promise<User | null> {
		const q = `
			SELECT ${userSelect}
			FROM users
			WHERE id = $1;
		`
		const result = await query<User>({ text: q }, [id])
		if (result.rows.length === 0) {
			return null
		}
		return result.rows[0]?.reify() ?? null
	}

	public async deleteUser(id: number): Promise<void> {
		const q = `
			DELETE FROM users
			WHERE id = $1;
		`
		await query<void>({ text: q }, [id])
	}

	public async getUserByEmail(email: string): Promise<User | null> {
		const q = `
			SELECT ${userSelect}
			FROM users
			WHERE email = $1;
		`
		const result = await query<User>({ text: q }, [email])
		if (result.rows.length === 0) {
			return null
		}
		return result.rows[0]?.reify() ?? null
	}

	public async logout(): Promise<void> {
		return Promise.resolve();
	}

	public async login(email: string, password: string): Promise<string | null> {
		const user = await this.getUserByEmail(email)
		if (!user) {
			logInfo	('User not found')
			return null
		}
		const isPasswordValid = await passwordService.comparePassword(password, user.password)
		if (!isPasswordValid) {
			return null
		}

		const JWT_SECRET = process.env['STATIC_JWT'] ?? 'dev-secret'

		const roles = await query<{ name: string }>(
			{
				text: `
				SELECT r.name
				FROM user_roles ur
				JOIN roles r ON ur.role_id = r.id
				WHERE ur.user_id = $1
			`,
			},
			[user.id]
		)

		const token = sign(
			{
				id: user.id,
				email: user.email,
				name: user.name,
				roles: roles.rows.map((role) => role.reify().name) ?? [],
			},
			JWT_SECRET,
			{
				expiresIn: '1m',
				algorithm: 'HS256',
				issuer: 'ts-animations-server',
				audience: 'ts-animations-client',
			}
		)

		return token
	}
}

export default new UserService()
