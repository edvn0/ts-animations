import vue from "eslint-plugin-vue";
import parserTs from "@typescript-eslint/parser";
import parserVue from "vue-eslint-parser";
import stylistic from "@stylistic/eslint-plugin";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@stylistic/ts": stylistic,
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "@stylistic/ts/semi": ["error", "always"],
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTs,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      vue,
      "@stylistic/ts": stylistic,
    },
    rules: {
      "vue/no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "warn",
      "@stylistic/ts/semi": ["error", "always"],
    },
  },
  {
    name: "prettier",
    rules: prettier.rules,
  },
];
