import { Router } from 'express'
import { userRouterV1 } from './v1/user.router'
import { userRouterV2 } from './v2/user.router'
import { allowAll } from '../../middleware/allow.role.middleware'
import authRouter from './auth.router'

export const apiRouter = Router()

apiRouter.use('/v1/users', allowAll(), userRouterV1)
apiRouter.use('/v2/users', allowAll(), userRouterV2)

apiRouter.use('/login', authRouter)
