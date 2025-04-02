import { load } from "jsr:@std/dotenv";
await load({ export: true });

import { Application } from "@oak/oak";
import { sigInt, sigTerm } from "./exit-handlers.ts";
import { authRouter } from "./routes/auth/auth.router.ts";

const handlers = [sigInt, sigTerm];
for (const handler of handlers) {
  handler();
}

const app = new Application();

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.listen({
  port: 3000,
});
