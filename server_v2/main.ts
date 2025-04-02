import "jsr:@std/dotenv/load";
import { query } from "./database";

console.log("Connecting to database...");
await query<any>("SELECT 1");
console.log("Database connection successful.");
