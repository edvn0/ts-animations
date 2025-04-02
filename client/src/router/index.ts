import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from "vue-router";
import LoginPage from "@pages/LoginPage.vue";
import HomePage from "@pages/HomePage.vue";
import tokenService, { validateToken } from "@services/token.service";

const jwtGuard = (
  _req: RouteLocationNormalized,
  _res: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = tokenService.get();

  if (!token) {
    next({ name: "login" });
    return;
  }

  const isValid = validateToken(token);

  if (!isValid) {
    tokenService.clear();
    next({ name: "login" });
    return;
  }

  next();
};

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage, beforeEnter: jwtGuard },
    { path: "/login", name: "login", component: LoginPage },
  ],
});
