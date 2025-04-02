import { load } from "jsr:@std/dotenv";
await load({ export: true });

import { Application, Router } from "@oak/oak";
import { sigInt, sigTerm } from "./exit-handlers.ts";

const handlers = [sigInt, sigTerm];
for (const handler of handlers) {
	handler();
}

const router = new Router();

router.get("/", ({ response }) => {
	response.body = "Hello world\n";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({
	port: 3000,
});
