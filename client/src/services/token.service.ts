import { jwtDecode, type JwtPayload } from "jwt-decode";

export interface ITokenService {
  set(token: string): void;
  get(): string | null;
  clear(): void;
}

const decodeImpl = (token: string): JwtPayload | null => {
  try {
    const payload = jwtDecode(token, {});
    if (typeof payload === "object" && payload !== null) {
      return payload;
    }
  } catch (error) {
    throw new Error("Invalid token");
  }
  return null;
};

export const validateToken = (token: string) => {
  if (!token) {
    return false;
  }
  const payload = decodeImpl(token);
  if (!payload?.exp) {
    return false;
  }
  if (payload.exp * 1000 < Date.now()) {
    return false;
  }
  return true;
};

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeImpl(token);
    return typeof payload?.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

class TokenService implements ITokenService {
  private readonly key = "token";

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

  public decode(token: string): JwtPayload | null {
    return decodeImpl(token);
  }

  public clear(): void {
    localStorage.removeItem(this.key);
  }
}

export default new TokenService();
