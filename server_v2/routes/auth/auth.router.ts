import { Context, Router } from "@oak/oak";
import userService from "../../services/user.service.ts";
import { logError } from "../../logger.ts";

const authRouter = new Router();

const validateLogin = async (ctx: Context, next: () => Promise<unknown>) => {
  let parsedBody;

  try {
    if (ctx.request.hasBody) {
      parsedBody = await ctx.request.body.json();
    } else {
      ctx.response.status = 400;
      ctx.response.body = { errors: [{ msg: "No request body found" }] };
      return;
    }
  } catch (_error) {
    logError("Could not parse body.", _error);

    ctx.response.status = 400;
    ctx.response.body = { errors: [{ msg: "Invalid request body" }] };
    return;
  }

  const errors = [];
  if (!parsedBody.email) {
    errors.push({ param: "email", msg: "Email is required" });
  }
  if (!parsedBody.password || typeof parsedBody.password !== "string") {
    errors.push({
      param: "password",
      msg: "Password is required and must be a string",
    });
  }

  if (errors.length > 0) {
    ctx.response.status = 400;
    ctx.response.body = { errors };
    return;
  }

  ctx.state.body = parsedBody;
  await next();
};

authRouter.post("/login", validateLogin, async (ctx: Context) => {
  const { email, password } = ctx.state.body;

  const token = await userService.login(email, password);
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = "Invalid email or password";
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { token };
});

authRouter.post("/logout", async (ctx: Context) => {
  await userService.logout();
  ctx.response.status = 204;
});

export { authRouter };
