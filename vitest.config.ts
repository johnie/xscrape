import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
      xscrape: `${import.meta.dirname}/src/index.ts`,
    },
  },
  test: {
    environment: "node",
  },
});
