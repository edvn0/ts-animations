import { Router } from 'express'
import { userRouterV1 } from './v1/user.router';
import { userRouterV2 } from './v2/user.router';

export const apiRouter = Router()

apiRouter.use('/v1/users', userRouterV1);
apiRouter.use('/v2/users', userRouterV2);