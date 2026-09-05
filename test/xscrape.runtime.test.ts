import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, test } from "vitest";

import { defineScraper } from "@/index";

import {
  kitchenSink,
  kitchenSinkWithLinks,
  largeKitchenSink,
} from "./__fixtures__/html";

const WORD_BOUNDARY_REGEX = /\s+/u;

const passthroughSchema = <T extends object>(): StandardSchemaV1<T, T> => ({
  "~standard": {
    // SAFETY: Mock schema metadata types for StandardSchemaV1 testing.
    types: {} as StandardSchemaV1.Types<T, T>,
    validate: (value) => ({
      // SAFETY: Passthrough schema returns the validated value typed as T.
      value: value as T,
    }),
    vendor: "test",
    version: 1,
  },
});

const failingSchema = (
  issues: readonly StandardSchemaV1.Issue[] = [{ message: "invalid" }]
): StandardSchemaV1<unknown, never> => ({
  "~standard": {
    // SAFETY: Mock schema metadata types for StandardSchemaV1 testing.
    types: {} as StandardSchemaV1.Types<unknown, never>,
    validate: () => ({ issues }),
    vendor: "test",
    version: 1,
  },
});

const missingValueSchema = <T extends object>(): StandardSchemaV1<T, T> => ({
  "~standard": {
    // SAFETY: Mock schema metadata types for StandardSchemaV1 testing.
    types: {} as StandardSchemaV1.Types<T, T>,
    // SAFETY: Incomplete mock result intentionally tests missing value error path.
    validate: () => ({}) as StandardSchemaV1.Result<T>,
    vendor: "test",
    version: 1,
  },
});

describe("xscrape runtime boundary", () => {
  test("extracts metadata, text, and computed reading time", async () => {
    const scraper = defineScraper({
      extract: {
        description: {
          selector: 'meta[name="description"]',
          value: "content",
        },
        keywords: {
          selector: 'meta[name="keywords"]',
          value(node) {
            return (
              node
                .attr("content")
                ?.split(",")
                .map((keyword) => keyword.trim()) ?? []
            );
          },
        },
        readingTime: {
          selector: "body",
          value(node) {
            return node.text().split(WORD_BOUNDARY_REGEX).filter(Boolean)
              .length;
          },
        },
        title: { selector: "title" },
      },
      schema: passthroughSchema<{
        description?: string;
        keywords?: string[];
        readingTime?: number;
        title?: string;
      }>(),
    });

    const { data, error } = await scraper(largeKitchenSink);

    expect(error).toBeUndefined();
    expect(data?.title).toBe("HTML Kitchen Sink");
    expect(data?.description).toBe(
      "A comprehensive HTML kitchen sink example demonstrating a variety of HTML elements for testing and styling."
    );
    expect(data?.keywords).toStrictEqual([
      "HTML",
      "kitchen sink",
      "example",
      "meta tags",
      "og tags",
      "JSON-LD",
    ]);
    expect(data?.readingTime).toBeGreaterThan(20);
  });

  test("extracts arrays, nested structures, and raw markup", async () => {
    const scraper = defineScraper({
      extract: {
        headings: [{ selector: "h2" }],
        image: {
          selector: "head",
          value: {
            url: {
              selector: 'meta[property="og:image"]',
              value: "content",
            },
            width: {
              selector: 'meta[property="og:image:width"]',
              value: "content",
            },
          },
        },
        markup: {
          selector: "head",
          value(node) {
            return node.html();
          },
        },
      },
      schema: passthroughSchema<{
        headings?: string[];
        image?: {
          url?: string;
          width?: string;
        };
        markup?: string;
      }>(),
    });

    const { data, error } = await scraper(largeKitchenSink);

    expect(error).toBeUndefined();
    expect(data?.headings).toContain("Headings");
    expect(data?.headings).toContain("Text Elements");
    expect(data?.image).toStrictEqual({
      url: "https://example.com/images/kitchen-sink.jpg",
      width: undefined,
    });
    expect(data?.markup).toContain('<meta name="description"');
  });

  test("extracts arrays with attribute shorthands", async () => {
    const scraper = defineScraper({
      extract: {
        links: [{ selector: "a", value: "href" }],
      },
      schema: passthroughSchema<{
        links?: string[];
      }>(),
    });

    const { data, error } = await scraper(kitchenSinkWithLinks);

    expect(error).toBeUndefined();
    expect(data).toStrictEqual({
      links: [
        "https://example.com",
        "#internal-link",
        "mailto:example@example.com",
      ],
    });
  });

  test("applies async transforms after validation", async () => {
    const scraper = defineScraper({
      extract: {
        title: { selector: "title" },
      },
      schema: passthroughSchema<{
        title?: string;
      }>(),
      transform: async (data) => {
        await Promise.resolve();
        return {
          title: data.title?.toUpperCase(),
        };
      },
    });

    const { data, error } = await scraper(kitchenSink);

    expect(error).toBeUndefined();
    expect(data).toStrictEqual({ title: "EXAMPLE TITLE" });
  });

  test("returns validation issues without leaking runtime internals", async () => {
    const issues = [{ message: "title is required", path: ["title"] }] as const;
    const scraper = defineScraper({
      extract: {
        title: { selector: "title" },
      },
      schema: failingSchema(issues),
    });

    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toStrictEqual({
      code: "VALIDATION_FAILED",
      issues,
      message: "Extracted data did not match the schema",
      stage: "validate",
    });
  });

  test("returns transform errors as scraper errors", async () => {
    const scraper = defineScraper({
      extract: {
        title: { selector: "title" },
      },
      schema: passthroughSchema<{
        title?: string;
      }>(),
      transform: () => {
        throw new Error("transform failed");
      },
    });

    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toMatchObject({
      cause: new Error("transform failed"),
      code: "TRANSFORM_FAILED",
      stage: "transform",
    });
  });

  test("guards against validators that succeed without a value", async () => {
    const scraper = defineScraper({
      extract: {
        title: { selector: "title" },
      },
      schema: missingValueSchema<{
        title?: string;
      }>(),
    });

    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toMatchObject({
      code: "INVALID_VALIDATION_RESULT",
      message: "Validation succeeded but no data was returned",
      stage: "validate",
    });
  });

  test("reuses the same scraper across multiple calls", async () => {
    const scraper = defineScraper({
      extract: {
        title: { selector: "title" },
      },
      schema: passthroughSchema<{
        title?: string;
      }>(),
    });

    const first = await scraper(kitchenSink);
    const second = await scraper(
      "<html><head><title>Other</title></head><body></body></html>"
    );

    expect(first.data).toStrictEqual({ title: "Example Title" });
    expect(second.data).toStrictEqual({ title: "Other" });
  });
});
