import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";

process.env = { ...process.env, ...loadEnv("", process.cwd()) };
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(
      {
        configNames: ["tsconfig.app.json"],
      },
    ),
  ],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
