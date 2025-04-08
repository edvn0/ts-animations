import { Router } from "@oak/oak/router";
import { authenticateToken } from "../../middleware/authenticate-token.middleware.ts";
import { allowAll } from "../../middleware/allow-role.middleware.ts";
import { userRouterV1 } from "./user/user.router.ts";

export const apiRouter = new Router();

apiRouter.use(authenticateToken);
apiRouter.use(
  "/v1/users",
  allowAll,
  userRouterV1.routes(),
  userRouterV1.allowedMethods(),
);
// apiRouter.use("/v1/roles", allowAll, roleRouterV1.routes(), roleRouterV1.allowedMethods());
