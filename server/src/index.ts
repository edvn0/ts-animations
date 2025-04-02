import 'dotenv/config'
import express from 'express'
import { apiRouter } from './routes/api/api.router'
import { connectDatabase, destroy } from './db/connect-database'
import authRouter from './routes/auth/auth.router'
import { authenticateToken } from './middleware/auth.middleware'
import { logError, logInfo } from './logger'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = 4000

const JWT = process.env['STATIC_JWT']
if (!JWT) {
	logError('JWT is not defined in the environment variables')
	process.exit(1)
} else {
	logInfo(`JWT is defined as ${JWT}`)
}

app.use('/api', authRouter)
app.use('/api', authenticateToken, apiRouter)

process.on('beforeExit', async () => {
	await destroy()
	logInfo('Database connection closed')
	process.exit(0)
})

async function startServer() {
	try {
		await connectDatabase()
		app.listen(PORT, () => {
			logInfo(`Server is running on port ${PORT}`)
		})
	} catch (err) {
		logError('Failed to connect to database:', err)
		process.exit(1)
	}
}

startServer()
