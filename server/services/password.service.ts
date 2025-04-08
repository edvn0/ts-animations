import { hash, verify } from "jsr:@denorg/scrypt@4.4.4";

class PasswordService {
  public hashPassword(
    { password }: { password: string },
  ): string {
    return hash(password, {
      logN: 2,
    });
  }

  public comparePasswords(
    { password, hashedPassword }: { password: string; hashedPassword: string },
  ): boolean {
    return verify(password, hashedPassword);
  }
}

export default new PasswordService();
