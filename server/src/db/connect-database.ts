import { connect } from 'ts-postgres'
import type { Client } from 'ts-postgres'
import { createPool } from 'generic-pool'
import { createUserTable } from './models/user.model'
import { query } from './queries'
import { createUserRolesTables } from './models/user.roles.model'
import { logError, logInfo } from '../logger'

export const pool = createPool(
	{
		create: async () => {
			const client = await connect({
				host: process.env['POSTGRES_HOST'] ?? 'localhost',
				port: Number(process.env['POSTGRES_PORT']) || 5432,
				user: process.env['POSTGRES_USER'] ?? 'postgres',
				password: process.env['POSTGRES_PASSWORD'] ?? 'postgres',
				database: process.env['POSTGRES_DB'] ?? 'postgres',
			})
			client.on('error', (e) => {
				logError('Database error:', e)
			});
			return client
		},
		destroy: (client: Client) => client.end(),
		validate: async (client: Client) => {
			try {
				await client.query({ text: 'SELECT 1' })
				return true
			} catch {
				return false
			}
		},
	},
	{ testOnBorrow: true }
)

async function setup(setupFunctions: Array<() => Promise<void>>) {
	logInfo('Setting up database...')
	for (const setupFunction of setupFunctions) {
		await setupFunction()
	}
	logInfo('Database setup complete.')
}
export async function connectDatabase(tryCount: number = 10): Promise<void> {
	for (let i = 0; i < tryCount; i++) {
		try {
			await query({ text: 'SELECT 1' })

			await setup([createUserTable, createUserRolesTables])

			return
		} catch (error) {
			logError(`Database connection attempt ${i + 1} failed:`, error)
			if (i === tryCount - 1) throw error
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}
}

export async function destroy() {
	await pool.drain()
	await pool.clear()
}
