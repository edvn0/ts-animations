import { Router } from 'express'
import userService, { UpdateUserParameters, type User } from '../../../services/user.service'
import { body, query, validationResult } from 'express-validator';

export const userRouterV2 = Router()

type UserResponse = {
	id: number
	name: string
	email: string
	createdAt: Date
	updatedAt: Date
}

const mapToResponse = (user: User): UserResponse => ({
	id: user.id,
	name: user.name,
	email: user.email,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});


userRouterV2.get('/', async (_req, res) => {
	const users = await userService.getAllUsers()
	if (users.length === 0) {
		res.status(404).json({ message: 'No users found' })
		return;
	}
	res.json(users.map(mapToResponse));
})

userRouterV2.get('/:id', async (req, res) => {
	const userId = parseInt(req.params.id, 10)
	if (isNaN(userId)) {
		res.status(400).json({ message: 'Invalid user ID' })
		return
	}
	const user = await userService.getUserById(userId)
	if (!user) {
		res.status(404).json({ message: 'User not found' })
		return
	}
	res.json(user)
});

userRouterV2.put('/:id',
	body('name').optional().isString(),
	body('email').optional().isEmail(),
	body('password').optional().isString(),
	query('id').isInt().toInt(),
	async (req, res) => {
		const result = validationResult(req);
		if (!result.isEmpty()) {
			res.status(400).json({ errors: result.array() });
			return;
		}
		const userId = parseInt(req.params?.id, 10)
		if (isNaN(userId)) {
			res.status(400).json({ message: 'Invalid user ID' })
			return;
		}
		const { name, email, password } = req.body
		const updateParameters: UpdateUserParameters = {
			name,
			email,
			password,
		};

		const updatedUser = await userService.updateUser(userId, updateParameters)
		if (!updatedUser) {
			res.status(404).json({ message: 'User not found' })
			return;
		}
		res.json(mapToResponse(updatedUser))
	});

userRouterV2.post('/', (req, res) => {
	res.json({ message: 'User created', data: req.body })
})

