import { Router } from 'express'
import userService from '../../services/user.service'
import { body, validationResult } from 'express-validator'

const authRouter = Router()

authRouter.post(
	'/login',
	body('email').notEmpty().withMessage('Email is required'),
	body('password').notEmpty().isString(),
	async (req, res) => {
		const result = validationResult(req)
		if (!result.isEmpty()) {
			res.status(400).json({ errors: result.array() })
			return
		}

		const { email, password } = req.body
		if (!email || !password) {
			res.status(400).send('Missing credentials')
			return
		}
		const token = await userService.login(email, password)
		if (!token) {
			res.status(401).send('Invalid email or password')
			return
		}

		res.json({ token })
	}
)

authRouter.post('/logout', async (_req, res) => {
	await userService.logout()
	res.status(204).send()
})

export default authRouter
