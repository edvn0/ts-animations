import { closePool, IDatabaseService } from "./database/database.ts";

const sigInt = (db: IDatabaseService) =>
  Deno.addSignalListener("SIGINT", async () => {
    await closePool(db);
    Deno.exit(0);
  });
const sigTerm = (db: IDatabaseService) =>
  Deno.addSignalListener("SIGTERM", async () => {
    await closePool(db);
    Deno.exit(0);
  });

export { sigInt, sigTerm };
