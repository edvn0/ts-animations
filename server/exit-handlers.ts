import { closePool, IDatabaseService } from "./database/database.ts";

const handlers: Deno.Signal[] = ["SIGINT", "SIGTERM"];
export function handleSignals(database: IDatabaseService) {
  for (const signal of handlers) {
    Deno.addSignalListener(signal, async () => {
      await closePool(database);
      Deno.exit(0);
    });
  }
}
