import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env['STATIC_JWT'] ?? 'dev-secret'

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
	const authenticationHeader = req.headers.authorization
	if (!authenticationHeader?.startsWith('Bearer ')) {
		res.sendStatus(401)
		return
	}

	const token = authenticationHeader.split(' ')[1]
	if (!token) {
		res.sendStatus(401)
		return
	}
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		(req as any).user = payload
		next()
	} catch {
		res.sendStatus(403)
	}
}
