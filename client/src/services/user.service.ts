import type { User } from '../models/user.type';
import httpService, { type HttpService } from './http.service';

class UserService {
    private readonly version = 1;

    constructor(private readonly httpService: HttpService) {}

    public async getUsers(): Promise<User[]> {
        return this.httpService.get<User[]>(`/v${this.version}/users`);
    }
}

export default new UserService(httpService);