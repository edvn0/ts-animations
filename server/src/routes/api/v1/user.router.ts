import { Router } from 'express'

export const userRouterV1 = Router()

userRouterV1.get('/', (_req, res) => {
	res.json({ message: 'User list' })
})

userRouterV1.post('/', (req, res) => {
	res.json({ message: 'User created', data: req.body })
})
