import { jwtDecode } from 'jwt-decode';

export interface ITokenService {
	set(token: string): void;
	get(): string | null;
	clear(): void;
};



export function isTokenExpired(token: string): boolean {
	try {
		const payload = jwtDecode(token, {});
		return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
	} catch {
		return true;
	}
}

class TokenService implements ITokenService {
	private readonly key = 'token';

	public set(token: string): void {
		localStorage.setItem(this.key, token);
	}

	public get(): string | null {
		const token = localStorage.getItem(this.key);
		if (!token || isTokenExpired(token)) {
			this.clear();
			return null;
		}
		return token;
	}

	public clear(): void {
		localStorage.removeItem(this.key);
	}
}

export default new TokenService();

