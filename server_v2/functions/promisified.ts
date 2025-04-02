// Promisify setTimeout
import { scrypt } from "node:crypto";
import { promisify } from "node:util";

const sleep = promisify(setTimeout);

export async function wait(): Promise<void> {
  await sleep();
}
export const scryptAsync = promisify(scrypt);
