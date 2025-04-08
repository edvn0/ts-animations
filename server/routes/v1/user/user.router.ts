import { Router } from "@oak/oak/router";
import { Context } from "@oak/oak/context";
import {
  CouldNotCreateUserError,
  User,
} from "../../../services/user.service.ts";
import { userService } from "../../../main.ts";

export const userRouterV1 = new Router();

type UserResponse = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

const mapToResponse = (user: User): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

userRouterV1.get("/", async (ctx: Context) => {
  const users = await userService.getAllUsers();
  if (users.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: "No users found" };
    return;
  }
  ctx.response.body = users.map(mapToResponse);
});

userRouterV1.get("/me", async (ctx: Context) => {
  const user = ctx.state.user as User | undefined;
  if (!user?.id) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Unauthorized" };
    return;
  }
  const userData = await userService.getUserById(user.id);
  if (!userData) {
    ctx.response.status = 404;
    ctx.response.body = { message: "User not found" };
    return;
  }
  ctx.response.body = mapToResponse(userData);
});

userRouterV1.get("/:id", async (ctx: Context<{ id: number }>) => {
  const idParameter = ctx.state.id;
  if (isNaN(idParameter)) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid user ID" };
    return;
  }
  const user = await userService.getUserById(idParameter);
  if (!user) {
    ctx.response.status = 404;
    ctx.response.body = { message: "User not found" };
    return;
  }
  ctx.response.body = mapToResponse(user);
});

userRouterV1.put("/:id", async (ctx: Context<{ id: number }>) => {
  const idParameter = ctx.state.id;
  if (isNaN(idParameter)) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid user ID" };
    return;
  }

  const body = await ctx.request.body.json();
  const { name, email, password } = body;

  const updateParameters: { name: string; email: string; password: string } = {
    name,
    email,
    password,
  };
  const updated = await userService.updateUser(idParameter, updateParameters);

  if (!updated) {
    ctx.response.status = 404;
    ctx.response.body = { message: "User not found" };
    return;
  }

  ctx.response.body = mapToResponse(updated);
});

userRouterV1.post("/", async (ctx: Context) => {
  const { name, email, password } = await ctx.request.body.json();

  if (
    typeof name !== "string" || typeof email !== "string" ||
    typeof password !== "string"
  ) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid input" };
    return;
  }

  const existing = await userService.getUserByEmail(email);
  if (existing) {
    ctx.response.status = 400;
    ctx.response.body = { message: "User already exists" };
    return;
  }

  try {
    const user = await userService.createUser(name, email, password);
    if (!user) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Could not create user" };
      return;
    }
    ctx.response.status = 201;
    ctx.response.body = mapToResponse(user);
  } catch (err) {
    if (err instanceof CouldNotCreateUserError) {
      ctx.response.status = 400;
      ctx.response.body = { message: err.message };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: "Internal server error" };
    }
  }
});
