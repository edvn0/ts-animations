import { delay } from "https://deno.land/std@0.214.0/async/delay.ts";

export async function wait(ms: number): Promise<void> {
  await delay(ms);
}
