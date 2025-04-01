import { randomBytes, timingSafeEqual } from 'crypto'
import { scryptAsync } from '../functions/promisified'

class PasswordService {
	private static readonly saltCount = 16
	private static readonly keyLength = 64

	public async hashPassword(password: string): Promise<string> {
		const salt = randomBytes(PasswordService.saltCount).toString('hex')
		const hash = (await scryptAsync(password, salt, PasswordService.keyLength)) as Buffer
		return `${salt}:${hash.toString('hex')}`
	}

	public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		const [salt, key] = hashedPassword.split(':')
		if (!salt || !key) {
			return false
		}

		const hash = (await scryptAsync(password, salt, PasswordService.keyLength)) as Buffer
		const keyBuffer = Buffer.from(key, 'hex')
		return timingSafeEqual(hash, keyBuffer)
	}
}

export default new PasswordService()
