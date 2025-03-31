// tests/user-service.test.ts
import { describe, it, vi, expect, beforeEach } from 'vitest';
import userService, { UpdateUserParameters } from '../services/user.service';
import * as dbModule from '../db/queries';
import passwordService from '../services/password.service';

vi.mock('../services/password.service', () => ({
	default: {
		hashPassword: vi.fn()
	}
}));

vi.mock('../db/queries', async () => {
	const actual = await vi.importActual<typeof import('../db/queries')>('../db/queries');
	return {
		...actual,
		query: vi.fn()
	};
});

describe('UserService.updateUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should execute correct update query when updating name, email, and password', async () => {
		const userId = 123;
		const parameters: UpdateUserParameters = {
			name: 'New Name',
			email: 'new@example.com',
			password: 'newpassword'
		};

		const hashedPassword = 'salt:hashedvalue';
		(passwordService.hashPassword as ReturnType<typeof vi.fn>).mockResolvedValue(hashedPassword);

		const mockUser = {
			id: userId,
			name: parameters.name,
			email: parameters.email,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
			reify: vi.fn().mockReturnValue('reifiedUser')
		};

		(dbModule.query as ReturnType<typeof vi.fn>).mockResolvedValue({
			rows: [mockUser]
		});

		const result = await userService.updateUser(userId, parameters);

		expect(passwordService.hashPassword).toHaveBeenCalledWith(parameters.password);
		expect(dbModule.query).toHaveBeenCalledWith(
			expect.objectContaining({
				text: expect.stringMatching(/UPDATE users[\s\S]+SET name = \$1, email = \$2, password = \$3, updated_at = CURRENT_TIMESTAMP[\s\S]+WHERE id = \$4/)
			}),
			[parameters.name, parameters.email, hashedPassword, userId]
		);
		expect(result).toBe('reifiedUser');
	});

	it('should throw an error when no fields are provided', async () => {
		await expect(userService.updateUser(1, {})).rejects.toThrow('No fields to update');
	});

	it('should update only name', async () => {
		const userId = 1;
		const parameters: UpdateUserParameters = { name: 'Alice' };
		const mockUser = {
			id: userId,
			name: 'Alice',
			email: 'existing@example.com',
			password: 'hash',
			createdAt: new Date(),
			updatedAt: new Date(),
			reify: vi.fn().mockReturnValue('reifiedUser')
		};

		(dbModule.query as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [mockUser] });

		const result = await userService.updateUser(userId, parameters);

		expect(dbModule.query).toHaveBeenCalledWith(
			expect.objectContaining({
				text: expect.stringContaining('SET name = $1')
			}),
			['Alice', userId]
		);
		expect(result).toBe('reifiedUser');
	});

	it('should update only email', async () => {
		const userId = 2;
		const parameters: UpdateUserParameters = { email: 'bob@example.com' };
		const mockUser = {
			id: userId,
			name: 'Bob',
			email: 'bob@example.com',
			password: 'hash',
			createdAt: new Date(),
			updatedAt: new Date(),
			reify: vi.fn().mockReturnValue('reifiedUser')
		};

		(dbModule.query as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [mockUser] });

		const result = await userService.updateUser(userId, parameters);

		expect(dbModule.query).toHaveBeenCalledWith(
			expect.objectContaining({
				text: expect.stringContaining('SET email = $1')
			}),
			['bob@example.com', userId]
		);
		expect(result).toBe('reifiedUser');
	});

	it('should update only password', async () => {
		const userId = 3;
		const parameters: UpdateUserParameters = { password: 'newpass' };
		const hashed = 'salt:hash';

		(passwordService.hashPassword as ReturnType<typeof vi.fn>).mockResolvedValue(hashed);

		const mockUser = {
			id: userId,
			name: 'User',
			email: 'user@example.com',
			password: hashed,
			createdAt: new Date(),
			updatedAt: new Date(),
			reify: vi.fn().mockReturnValue('reifiedUser')
		};

		(dbModule.query as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [mockUser] });

		const result = await userService.updateUser(userId, parameters);

		expect(passwordService.hashPassword).toHaveBeenCalledWith('newpass');
		expect(dbModule.query).toHaveBeenCalledWith(
			expect.objectContaining({
				text: expect.stringContaining('SET password = $1')
			}),
			[hashed, userId]
		);
		expect(result).toBe('reifiedUser');
	});
});
