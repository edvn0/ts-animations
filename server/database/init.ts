import { DatabaseService, IDatabaseService } from "./database.ts";
import { TableInitialisationFunction } from "./models/table-initialisation-function.type.ts";

export const initialiseDatabase = async (
  funcs: Array<TableInitialisationFunction> = [],
): Promise<IDatabaseService> => {
  const db: IDatabaseService = new DatabaseService();
  const result = db.queryOne<{ result: number }>("SELECT 1 + 1 AS result");
  if (!result) {
    throw new Error("Database connection failed");
  }
  for (const func of funcs) {
    await func(db);
  }
  return db;
};
