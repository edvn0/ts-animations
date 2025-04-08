import { Application } from "@oak/oak/application";
import { CorsOptions, oakCors } from "jsr:@tajpouria/cors";
import { load } from "jsr:@std/dotenv";

const __dirname = new URL(".", import.meta.url).pathname;
const env: string = Deno.env.get("ENV") || "development";
const envPath: string = Deno.realPathSync(`${__dirname}/environments/.env.${env}`);

await load({
  envPath,
  export: true,
});

logInfo(`Environment: ${env}`);

const db = await initialiseDatabase([createUserTable, createUserRolesTables]);
export const userService = new UserService(db);

import { authRouter } from "./routes/auth/auth.router.ts";
import { apiRouter } from "./routes/v1/api.router.ts";
import { createUserTable } from "./database/models/user.model.ts";
import { createUserRolesTables } from "./database/models/user.roles.model.ts";
import { initialiseDatabase } from "./database/init.ts";

const app = new Application();

const corsOptions: CorsOptions = {
  origin: "localhost:*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(oakCors(corsOptions));

app.use(authRouter.prefix("/api").routes());
app.use(authRouter.allowedMethods());

app.use(apiRouter.prefix("/api").routes());
app.use(apiRouter.allowedMethods());

import { UserService } from "./services/user.service.ts";
import { handleSignals } from "./exit-handlers.ts";
import { logInfo } from "./logger.ts";

handleSignals(db);

app.listen({
  port: 4000,
});
