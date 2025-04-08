// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "jsr:@std/assert@~0.222.1";
import { UserRoleName } from "../database/models/user.roles.model.ts";
import { JwtPayloadWithRoles } from "../routes/auth/models/jwt-payload.model.ts";
import { allowAll, allowRole } from "./allow-role.middleware.ts";
import { delay } from "https://deno.land/std@0.214.0/async/delay.ts";

Deno.test("allowRole - allows access when user has required role", async () => {
  let called = false;
  const ctx = {
    state: {
      user: {
        id: 1,
        email: "a@b.com",
        name: "Test",
        roles: ["admin"],
        iat: 1234567890,
        exp: 1234567890,
      } satisfies JwtPayloadWithRoles,
    },
    response: {},
  } as any;

  const middleware = allowRole("admin" as UserRoleName);
  await middleware(ctx, async () => {
    called = true;
    await delay(20);
  });

  assertEquals(called, true);
});

Deno.test("allowRole - denies access when user has no required role", async () => {
  const ctx = {
    state: {
      user: {
        id: 1,
        email: "a@b.com",
        name: "Test",
        roles: ["user"],
        iat: 1234567890,
        exp: 1234567890,
      } satisfies JwtPayloadWithRoles,
    },
    response: {},
  } as any;

  const middleware = allowRole("admin" as UserRoleName);
  await middleware(ctx, async () => {});

  assertEquals(ctx.response.status, 403);
  assertEquals(ctx.response.body, { message: "Forbidden: Role missing" });
});

Deno.test("allowRole - denies access when user is missing", async () => {
  const ctx = {
    state: {},
    response: {},
  } as any;

  const middleware = allowRole("admin" as UserRoleName);
  await middleware(ctx, async () => {});

  assertEquals(ctx.response.status, 401);
  assertEquals(ctx.response.body, { message: "Unauthorized" });
});

Deno.test("allowAll - allows access regardless of roles", async () => {
  let called = false;
  const ctx = {
    state: {
      user: {
        id: 1,
        email: "a@b.com",
        name: "Test",
        roles: [],
        iat: 1234567890,
        exp: 1234567890,
      } satisfies JwtPayloadWithRoles,
    },
    response: {},
  } as any;

  const middleware = allowAll;
  await middleware(ctx, async () => {
    called = true;
    await delay(20);
  });

  assertEquals(called, true);
});
