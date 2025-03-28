import { Router } from 'express'

export const userRouterV2 = Router()

userRouterV2.get('/', (req, res) => {
  res.json({ message: 'User list' })
})

userRouterV2.get('/:id', (req, res) => {
  res.json({ message: `User with id ${req.params.id}` })
});

userRouterV2.post('/', (req, res) => {
  res.json({ message: 'User created', data: req.body })
})

