import { describe, expect, it } from "vitest";

import { defineScraper } from "@/index";

import { compatibilityCases } from "../examples/schemas";
import { kitchenSink } from "./__fixtures__/html";

describe("xscrape standard-schema compatibility", () => {
  it.each(compatibilityCases)(
    "extracts required data with $name",
    async ({ schema }) => {
      const scraper = defineScraper({
        extract: {
          title: { selector: "title" },
        },
        schema,
      });

      const { data, error } = await scraper(kitchenSink);

      expect(error).toBeUndefined();
      expect(data).toStrictEqual({ title: "Example Title" });
    }
  );

  it.each(compatibilityCases)(
    "surfaces validation errors with $name",
    async ({ schema }) => {
      const scraper = defineScraper({
        extract: {
          title: { selector: "title" },
        },
        schema,
      });

      const { data, error } = await scraper(
        "<html><head></head><body></body></html>"
      );

      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    }
  );
});
