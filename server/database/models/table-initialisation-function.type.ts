import { IDatabaseService } from "../database.ts";

export type TableInitialisationFunction = (
  db: IDatabaseService,
) => Promise<boolean>;
