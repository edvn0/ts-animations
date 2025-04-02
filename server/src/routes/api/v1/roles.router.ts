import { Router } from "express";
import { JwtPayload } from "jsonwebtoken";

export const roleRouterV1 = Router();

roleRouterV1.get("/", (req, res) => {
  const { user } = req as any as { user: JwtPayload };
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { roles } = user;
  if (!Array.isArray(roles) || roles?.length === 0) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({ roles });
});

roleRouterV1.post("/", (req, res) => {
  res.json({ message: "User created", data: req.body });
});
