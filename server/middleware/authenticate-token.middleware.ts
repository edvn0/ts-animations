import { Context } from "@oak/oak/context";
import { JwtPayloadWithRoles } from "../routes/auth/models/jwt-payload.model.ts";
import { verify } from "@zaubrik/djwt";
import { logInfo } from "../logger.ts";

const JWT_SECRET = Deno.env.get("STATIC_JWT") ?? "dev-secret";

export async function authenticateToken(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  const header = ctx.request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
    return;
  }

  const token = header.split(" ")[1];

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    const payload = await verify<JwtPayloadWithRoles>(token, cryptoKey);
    logInfo(payload);
    ctx.state.user = payload;
    await next();
  } catch {
    ctx.response.status = 403;
    ctx.response.body = { message: "Forbidden" };
  }
}
