import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import userService, { CouldNotCreateUserError, UpdateUserParameters, type User } from '../../../services/user.service'

export const userRouterV1 = Router()

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
})

userRouterV1.get('/', async (_req, res) => {
	const users = await userService.getAllUsers()
	if (users.length === 0) {
		res.status(404).json({ message: 'No users found' })
		return
	}
	res.json(users.map(mapToResponse))
})


userRouterV1.get('/me', async (req, res) => {
	const { user } = req as any as { user: User }
	if (!user) {
		res.status(401).json({ message: 'Unauthorized' })
		return;
	}
	const { id } = user
	if (!id) {
		res.status(401).json({ message: 'Unauthorized' })
		return;
	}
	const userData = await userService.getUserById(id)
	if (!userData) {
		res.status(404).json({ message: 'User not found' })
		return
	}
	res.json(mapToResponse(userData))
});

userRouterV1.get('/:id(\\d+)', async (req, res) => {
	if (!req.params['id']) {
		res.status(400).json({ message: 'User ID is required' })
		return
	}
	const userId = parseInt(req.params['id'], 10)
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

userRouterV1.put(
	'/:id',
	body('name').optional().isString(),
	body('email').optional().isEmail(),
	body('password').optional().isString(),
	query('id').isInt().toInt(),
	async (req, res) => {
		const result = validationResult(req)
		if (!result.isEmpty()) {
			res.status(400).json({ errors: result.array() })
			return
		}
		const userId = parseInt(req.params['id'], 10)
		if (isNaN(userId)) {
			res.status(400).json({ message: 'Invalid user ID' })
			return
		}
		const { name, email, password } = req.body
		const updateParameters: UpdateUserParameters = {
			name,
			email,
			password,
		}

		const updatedUser = await userService.updateUser(userId, updateParameters)
		if (!updatedUser) {
			res.status(404).json({ message: 'User not found' })
			return
		}
		res.json(mapToResponse(updatedUser))
	}
)

const validators = [
	body('name').isString(),
	body('email').isEmail(),
	body('password').isString().isStrongPassword(),
];

userRouterV1.post('/', ...validators, async (req, res) => {
	const result = validationResult(req)
	if (!result.isEmpty()) {
		res.status(400).json({ errors: result.array() })
		return
	}

	const { name, password, email } = req.body as { email: string, name: string, password: string };
	const existingUser = await userService.getUserByEmail(email)
	if (existingUser) {
		res.status(400).json({ message: 'User already exists' })
		return
	}

	try {

		const user = await userService.createUser(name, email, password)
		if (!user) {
			res.status(400).json({ message: 'Could not create user.' })
			return
		}
		res.status(201).json(mapToResponse(user))
	} catch (error) {
		if (error instanceof CouldNotCreateUserError) {
			res.status(400).json({ message: error.message })
		} else {
			res.status(500).json({ message: 'Internal server error' })
		}
	}

});
