import { Context } from "@oak/oak/context";
import { UserRoleName } from "../database/models/user.roles.model.ts";
import { JwtPayloadWithRoles } from "../routes/auth/models/jwt-payload.model.ts";

export function allowRole(...allowed: UserRoleName[]) {
  return async (
    ctx: Context<{ user: JwtPayloadWithRoles }>,
    next: () => Promise<unknown>,
  ) => {
    const user = ctx.state.user;

    if (!user || !Array.isArray(user.roles)) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Unauthorized" };
      return;
    }

    if (allowed.length === 0) {
      await next();
      return;
    }

    const hasRole = user.roles.some((role) =>
      allowed.includes(role as UserRoleName)
    );
    if (!hasRole) {
      ctx.response.status = 403;
      ctx.response.body = { message: "Forbidden: Role missing" };
      return;
    }

    await next();
  };
}

export const allowAll = allowRole();
