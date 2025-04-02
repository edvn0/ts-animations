import { randomBytes, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { scryptAsync } from "../functions/promisified.ts";

class PasswordService {
  private static readonly saltCount = 16;
  private static readonly keyLength = 64;

  public async hashPassword(
    { password }: { password: string },
  ): Promise<string> {
    const salt = randomBytes(PasswordService.saltCount).toString("hex");
    const hash =
      (await scryptAsync(password, salt, PasswordService.keyLength)) as Buffer;
    return `${salt}:${hash.toString("hex")}`;
  }

  public async comparePassword(
    { password, hashedPassword }: { password: string; hashedPassword: string },
  ): Promise<boolean> {
    const [salt, key] = hashedPassword.split(":");
    if (!salt || !key) {
      return false;
    }

    const hash =
      (await scryptAsync(password, salt, PasswordService.keyLength)) as Buffer;
    const keyBuffer = Buffer.from(key, "hex");
    return timingSafeEqual(hash, keyBuffer);
  }
}

export default new PasswordService();
