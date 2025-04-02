import { closePool } from "./database.ts";

const sigInt = () => Deno.addSignalListener("SIGINT", async () => {
	await closePool();
	Deno.exit(0);
});
const sigTerm = () => Deno.addSignalListener("SIGTERM", async () => {
	await closePool();
	Deno.exit(0);
});

export {
	sigInt,
	sigTerm
};
