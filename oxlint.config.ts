import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, vitest, antiSlop],
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      // These modules implement the untrusted-data boundary rather than consuming already parsed data.
      files: ["src/internal/*.ts", "src/errors.ts", "src/helpers.ts"],
      rules: {
        "anti-slop/no-runtime-typeof": "off",
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unknown-returns": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
      },
    },
    {
      // Extraction results precede validation, so a recursive JSON-only type would be dishonest.
      files: ["src/types/extract.ts"],
      rules: { "anti-slop/no-unsafe-dictionary-type": "off" },
    },
    {
      // Deliberately malformed inputs exercise the public validation boundary.
      files: ["test/xscrape.contract.test.ts"],
      rules: {
        "anti-slop/no-unknown-parameters": "off",
        "anti-slop/no-unknown-returns": "off",
        "anti-slop/no-unsafe-dictionary-type": "off",
      },
    },
  ],
});
