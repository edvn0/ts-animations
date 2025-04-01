import type { User } from '../models/user.type';
import httpService, { type HttpService } from './http.service';
import type { ITokenService } from './token.service';
import tokenService from './token.service';

class UserService {
	private readonly version = 1;

	constructor(
		private readonly httpService: HttpService,
		private readonly tokenService: ITokenService
	) { }

	public async getUsers(): Promise<User[]> {
		return this.httpService.get<User[]>(`/v${this.version}/users`);
	}

	public async login(email: string, password: string): Promise<string> {
		const response = await this.httpService.post<{ token: string }>('/login', { email, password });
		if (!response.token) throw new Error('Invalid login');
		this.tokenService.set(response.token);
		return response.token;
	}
}

export default new UserService(httpService, tokenService);
