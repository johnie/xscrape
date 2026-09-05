import { describe, expect, test } from "vitest";
import { z } from "zod";

import { attr, defineScraper, html, many, nested, prop, text } from "@/index";

import extractionSchema from "../schema/extract-config.schema.json";

// SAFETY: extractionSchema is the static Draft 2020-12 schema JSON whose $schema is widened to string by JSON module imports.
const configSchema = z.fromJSONSchema(
  extractionSchema as Parameters<typeof z.fromJSONSchema>[0]
);

describe("declarative JSON schema", () => {
  test("accepts every declarative helper and nested arrays", async () => {
    const config = {
      attributes: many(attr("a", "href")),
      checked: prop("input", "checked"),
      markup: html("main"),
      nested: nested("main", { title: text("h1") }),
      products: many("article", { title: text("h2") }),
      shorthand: "title",
      titles: many("h2"),
    };
    expect(configSchema.safeParse(config).success).toBeTruthy();
    const encoded = JSON.stringify(config);
    const scrape = defineScraper({
      extract: JSON.parse(encoded),
      schema: z.record(z.string(), z.unknown()),
    });
    await expect(
      scrape("<main><h1>Hello</h1><article><h2>Product</h2></article></main>")
    ).resolves.toMatchObject({
      data: { products: [{ title: "Product" }] },
      ok: true,
    });
  });

  test.each([
    { title: { kind: "text", selecter: "h1" } },
    { title: { kind: "attr", selector: "h1" } },
    { title: { field: { field: "h1", kind: "many" }, kind: "many" } },
    { title: { kind: "unknown", selector: "h1" } },
    { title: { selector: "h1", value: () => "callback" } },
  ])("rejects malformed or nondeclarative configs: %j", (config) => {
    expect(configSchema.safeParse(config).success).toBeFalsy();
  });
});
