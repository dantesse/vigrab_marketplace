import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  clean: true,
  format: ["cjs"],
  bundle: true,
  splitting: false,
  sourcemap: true,
  external: ["@prisma/client", "prisma"],
  ...options,
}));