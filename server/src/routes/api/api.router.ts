import { Router } from 'express'
import { allowAll } from '../../middleware/allow.role.middleware'
import { roleRouterV1 } from './v1/roles.router'
import { userRouterV1 } from './v1/user.router'
import authRouter from '../auth/auth.router'

export const apiRouter = Router()

apiRouter.use('/v1/users', allowAll(), userRouterV1)
apiRouter.use('/v1/roles', allowAll(), roleRouterV1)

apiRouter.use('/login', authRouter)
