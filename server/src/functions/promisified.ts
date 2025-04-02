// Promisify setTimeout
import { scrypt } from "crypto";
import { promisify } from "util";

const sleep = promisify(setTimeout);

export async function wait(ms: number): Promise<void> {
  await sleep(ms);
}
export async function waitFor<T>(fn: () => T, ms: number): Promise<T> {
  await wait(ms);
  return fn();
}
export async function waitForCondition(
  fn: () => boolean,
  ms: number,
  interval: number = 100,
): Promise<void> {
  const endTime = Date.now() + ms;
  while (Date.now() < endTime) {
    if (fn()) return;
    await wait(interval);
  }
  throw new Error("Condition not met within the given time");
}

export const scryptAsync = promisify(scrypt);
