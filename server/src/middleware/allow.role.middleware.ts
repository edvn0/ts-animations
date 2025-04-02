import type { RequestHandler } from "express";
import { UserRoleName } from "../db/models/user.roles.model";
import { JwtPayloadWithRoles } from "./models/jwt.payload.model";

export function allowRole(...allowed: UserRoleName[]): RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user as JwtPayloadWithRoles | undefined;

    if (!user || !Array.isArray(user.roles)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const hasRole = user.roles.some((role) =>
      allowed.includes(role as UserRoleName)
    );
    if (!hasRole) {
      res.status(403).json({ error: "Forbidden: Role missing" });
      return;
    }

    next();
  };
}

export function allowAll(): RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user as JwtPayloadWithRoles | undefined;

    if (!user || !Array.isArray(user.roles)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    next();
  };
}
