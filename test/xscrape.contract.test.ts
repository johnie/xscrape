import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

import {
  attr,
  defineScraper,
  html,
  many,
  nested,
  parseHtml,
  prop,
  text,
  toDiagnostic,
} from "@/index";
import type { ExtractConfig, ParsedHtml } from "@/index";

const page =
  '<title>Example</title><main><article><h2>First</h2><a href="/one">One</a><span>42</span></article><article><h2>Second</h2><a href="/two">Two</a><span>7</span></article><input checked></main>';
const recordSchema = z.record(z.string(), z.unknown());

// SAFETY: These tests deliberately exercise invalid configurations supplied by untyped callers.
const untypedScraper = (extract: unknown) =>
  defineScraper({ extract: extract as ExtractConfig, schema: recordSchema });

const invalidSchema = (validate: () => unknown): StandardSchemaV1 => ({
  "~standard": {
    // SAFETY: Deliberately violates Standard Schema to test boundary diagnostics.
    validate: validate as StandardSchemaV1["~standard"]["validate"],
    vendor: "invalid-test",
    version: 1,
  },
});

describe("extraction contract", () => {
  test("helpers return ordinary serializable descriptors", () => {
    const fields = {
      products: many("article", { name: text("h2"), url: attr("a", "href") }),
    };
    const encoded = JSON.stringify(fields);
    expect(JSON.parse(encoded)).toStrictEqual({
      products: {
        field: {
          fields: {
            name: { kind: "text", selector: "h2" },
            url: { kind: "attr", name: "href", selector: "a" },
          },
          kind: "object",
          selector: "article",
        },
        kind: "many",
      },
    });
  });

  test("extracts nested arrays, text, markup, attributes and properties", async () => {
    const scrape = defineScraper({
      extract: {
        checkedAttribute: attr("input", "checked"),
        checkedProperty: prop("input", "checked"),
        first: nested("article", { title: text("h2") }),
        markup: html("article"),
        products: many("article", {
          title: text("h2"),
          url: attr("a", "href"),
        }),
        titles: many(text("h2")),
      },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: {
        checkedAttribute: "",
        checkedProperty: true,
        first: { title: "First" },
        markup: '<h2>First</h2><a href="/one">One</a><span>42</span>',
        products: [
          { title: "First", url: "/one" },
          { title: "Second", url: "/two" },
        ],
        titles: ["First", "Second"],
      },
      ok: true,
    });
  });

  test("preserves legacy property reads and array shorthand", async () => {
    const scrape = defineScraper({
      extract: {
        checked: { selector: "input", value: "checked" },
        titles: ["h2"],
      },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: { checked: true, titles: ["First", "Second"] },
      ok: true,
    });
  });

  test("missing nodes skip callbacks and distinguish scalar from array results", async () => {
    const callback = vi.fn<() => string>(() => "fallback");
    const scrape = defineScraper({
      extract: {
        callback: { selector: ".missing", value: callback },
        many: many(".missing"),
        scalar: text(".missing"),
      },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: { callback: undefined, many: [], scalar: undefined },
      ok: true,
    });
    expect(callback).not.toHaveBeenCalled();
  });

  test("arrays filter nullish callback results and flatten one level", async () => {
    const scrape = defineScraper({
      extract: {
        flattened: [{ selector: "h2", value: (node) => [node.text(), null] }],
        nulls: [{ selector: "h2", value: () => null }],
        undefineds: [{ selector: "h2", value: () => {} }],
      },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: {
        flattened: ["First", null, "Second", null],
        nulls: [],
        undefineds: [],
      },
      ok: true,
    });
  });

  test("callbacks see only preceding siblings, with their original key", async () => {
    const scrape = defineScraper({
      extract: {
        first: text("h2"),
        second: {
          selector: "h2",
          value: (_node, key, siblings) => ({
            key,
            keys: Object.keys(siblings),
            value: siblings.first,
          }),
        },
      },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: {
        first: "First",
        second: { key: "second", keys: ["first"], value: "First" },
      },
      ok: true,
    });
  });

  test("allows non-JSON values until schema validation", async () => {
    const date = new Date("2026-01-01");
    const scrape = defineScraper({
      extract: { date: { selector: "title", value: () => date } },
      schema: z.object({ date: z.date() }),
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: { date },
      ok: true,
    });
  });

  test("snapshots nested config without freezing caller-owned objects", async () => {
    const fields = { title: { selector: "h2" } };
    const extract = { first: nested("article", fields) };
    const scrape = defineScraper({ extract, schema: recordSchema });
    fields.title.selector = "a";
    await expect(scrape(page)).resolves.toStrictEqual({
      data: { first: { title: "First" } },
      ok: true,
    });
    expect(fields.title.selector).toBe("a");
  });

  test("supports shared config objects but rejects actual cycles", async () => {
    const fields = { title: text("h2") };
    const shared = defineScraper({
      extract: { a: nested("article", fields), b: nested("article", fields) },
      schema: recordSchema,
    });
    const sharedResult = await shared(page);
    expect(sharedResult.ok).toBeTruthy();
    const cyclic: Record<string, unknown> = {};
    cyclic.child = { selector: "article", value: cyclic };
    await expect(untypedScraper(cyclic)(page)).resolves.toMatchObject({
      error: { code: "INVALID_CONFIG", path: ["child"] },
      ok: false,
    });
  });

  test("treats __proto__ as an own data key", async () => {
    const schema: StandardSchemaV1 = {
      "~standard": {
        validate: (value) => ({ value }),
        vendor: "passthrough",
        version: 1,
      },
    };
    const scrape = defineScraper({
      extract: JSON.parse('{"__proto__":"title"}'),
      schema,
    });
    const result = await scrape(page);
    expect(result.ok).toBeTruthy();
    expect(
      Object.getOwnPropertyDescriptor(result.data, "__proto__")?.value
    ).toBe("Example");
    expect(Object.getPrototypeOf(result.data)).toBe(Object.prototype);
  });
});

describe("pipeline and diagnostics", () => {
  test("uses schema input keys and permits omitted defaulted fields", async () => {
    const scrape = defineScraper({
      extract: { raw: text("title") },
      schema: z
        .object({ raw: z.string(), source: z.string().default("web") })
        .transform(({ raw, source }) => ({ source, title: raw })),
      transform: ({ title }) => title.toUpperCase(),
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: "EXAMPLE",
      ok: true,
    });
  });

  test("supports unknown preprocessing inputs", async () => {
    const scrape = defineScraper({
      extract: { title: text("title") },
      schema: z.preprocess((value) => value, z.object({ title: z.string() })),
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: { title: "Example" },
      ok: true,
    });
  });

  test("awaits asynchronous schemas before transforming", async () => {
    const order: string[] = [];
    const schema: StandardSchemaV1<unknown, string> = {
      "~standard": {
        validate: async () => {
          await Promise.resolve();
          order.push("validate");
          return { value: "valid" };
        },
        vendor: "async-test",
        version: 1,
      },
    };
    const scrape = defineScraper({
      extract: {},
      schema,
      transform: (data) => {
        order.push("transform");
        return data.length;
      },
    });
    await expect(scrape(page)).resolves.toStrictEqual({ data: 5, ok: true });
    expect(order).toStrictEqual(["validate", "transform"]);
  });

  test("does not transform invalid data", async () => {
    const transform = vi.fn<() => void>();
    const scrape = defineScraper({
      extract: { title: ".missing" },
      schema: z.object({ title: z.string() }),
      transform,
    });
    await expect(scrape(page)).resolves.toMatchObject({
      error: { code: "VALIDATION_FAILED", stage: "validate" },
      ok: false,
    });
    expect(transform).not.toHaveBeenCalled();
  });

  test.each([undefined, null, false, 0, "", new Error("failed")])(
    "preserves arbitrary thrown causes: %s",
    async (cause) => {
      const scrape = defineScraper({
        extract: {},
        schema: recordSchema,
        transform: () => {
          throw cause;
        },
      });
      const result = await scrape(page);
      expect(result).toMatchObject({
        error: { code: "TRANSFORM_FAILED", stage: "transform" },
        ok: false,
      });
      expect(result.error?.cause).toBe(cause);
    }
  );

  test("allows undefined as a successful transform result", async () => {
    const scrape = defineScraper({
      extract: {},
      schema: recordSchema,
      transform: () => {},
    });
    await expect(scrape(page)).resolves.toStrictEqual({
      data: undefined,
      ok: true,
    });
  });

  test.each([null, undefined, {}])(
    "reports malformed validator results: %s",
    async (value) => {
      const scrape = defineScraper({
        extract: {},
        schema: invalidSchema(() => value),
      });
      await expect(scrape(page)).resolves.toMatchObject({
        error: { code: "INVALID_VALIDATION_RESULT", stage: "validate" },
        ok: false,
      });
    }
  );

  test("distinguishes validator exceptions from validation issues", async () => {
    const scrape = defineScraper({
      extract: {},
      schema: invalidSchema(() => {
        throw new Error("validator failed");
      }),
    });
    await expect(scrape(page)).resolves.toMatchObject({
      error: {
        cause: new Error("validator failed"),
        code: "VALIDATION_EXCEPTION",
        stage: "validate",
      },
      ok: false,
    });
  });

  test("reports invalid selectors with nested paths", async () => {
    const scrape = defineScraper({
      extract: { products: many("article", { title: text("[") }) },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toMatchObject({
      error: {
        code: "INVALID_SELECTOR",
        path: ["products", 0, "title"],
        selector: "[",
      },
      ok: false,
    });
  });

  test("reports callback exceptions at the matched array index", async () => {
    const scrape = defineScraper({
      extract: {
        titles: many({
          selector: "h2",
          value: (node) => {
            if (node.text() === "Second") {
              throw new Error("callback failed");
            }
            return node.text();
          },
        }),
      },
      schema: recordSchema,
    });
    await expect(scrape(page)).resolves.toMatchObject({
      error: { code: "EXTRACTION_FAILED", path: ["titles", 1], selector: "h2" },
      ok: false,
    });
  });

  test.each([false, true])(
    "rejects async callbacks, including rejected promises: %s",
    async (reject) => {
      const scrape = defineScraper({
        extract: {
          value: {
            selector: "title",
            value: async () => {
              await Promise.resolve();
              if (reject) {
                throw new Error("async failed");
              }
              return "async";
            },
          },
        },
        schema: recordSchema,
      });
      await expect(scrape(page)).resolves.toMatchObject({
        error: { code: "ASYNC_EXTRACTOR", path: ["value"], selector: "title" },
        ok: false,
      });
    }
  );

  test.each([
    null,
    [],
    { title: [] },
    { title: ["h1", "h2"] },
    { title: { kind: "unknown", selector: "title" } },
    { title: { kind: "attr", selector: "title" } },
  ])("rejects invalid config: %j", async (config) => {
    await expect(untypedScraper(config)(page)).resolves.toMatchObject({
      error: { code: "INVALID_CONFIG", stage: "extract" },
      ok: false,
    });
  });

  test("diagnostics omit nonserializable causes and normalize issue paths", () => {
    const cause = new Map();
    cause.set("self", cause);
    const encoded = JSON.stringify(
      toDiagnostic({
        cause,
        code: "TRANSFORM_FAILED",
        message: "failed",
        stage: "transform",
      })
    );
    expect(JSON.parse(encoded)).toStrictEqual({
      code: "TRANSFORM_FAILED",
      message: "failed",
      stage: "transform",
    });
    expect(
      toDiagnostic({
        code: "VALIDATION_FAILED",
        issues: [
          {
            message: "invalid",
            path: ["products", { key: 0 }, Symbol("name")],
          },
        ],
        message: "invalid data",
        stage: "validate",
      })
    ).toMatchObject({
      issues: [{ message: "invalid", path: ["products", 0, "Symbol(name)"] }],
    });
  });
});

describe("parsed document reuse", () => {
  test("reuses a private document across independent scrapers", async () => {
    const document = parseHtml(page);
    const titles = defineScraper({
      extract: { titles: many("h2") },
      schema: recordSchema,
    });
    const links = defineScraper({
      extract: { links: many(attr("a", "href")) },
      schema: recordSchema,
    });
    await expect(titles(document)).resolves.toStrictEqual(await titles(page));
    await expect(links(document)).resolves.toStrictEqual(await links(page));
    expect(Object.isFrozen(document)).toBeTruthy();
  });

  test("overlapping calls never share the current document", async () => {
    const scrape = defineScraper({
      extract: { title: text("title") },
      schema: z.object({ title: z.string() }),
      transform: async ({ title }) => {
        await Promise.resolve();
        return title;
      },
    });
    await expect(
      Promise.all([
        scrape(parseHtml(page)),
        scrape("<title>Other</title>"),
        scrape(page),
      ])
    ).resolves.toStrictEqual([
      { data: "Example", ok: true },
      { data: "Other", ok: true },
      { data: "Example", ok: true },
    ]);
  });

  test("rejects forged parsed document handles", async () => {
    const scrape = defineScraper({ extract: {}, schema: recordSchema });
    // SAFETY: Tests an untyped caller forging an opaque handle.
    await expect(scrape({} as ParsedHtml)).resolves.toMatchObject({
      error: { code: "INVALID_DOCUMENT", stage: "extract" },
      ok: false,
    });
  });
});
