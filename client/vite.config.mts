// scripts/vite_config.mjs
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(
      {
        configNames: ["tsconfig.app.json"],
      },
    ),
  ],
});
