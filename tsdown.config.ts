import { defineConfig } from "tsdown";

export default defineConfig({
  attw: { profile: "esm-only" },
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
  outDir: "dist",
  publint: true,
  report: true,
});
