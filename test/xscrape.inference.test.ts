import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { attr, defineScraper, many, nested, text } from "@/index";
import type { ExtractConfig, Scraper, ScraperConfig } from "@/index";

describe("xscrape inference", () => {
  test("extraction follows schema input, including renamed fields and callbacks", () => {
    const schema = z
      .object({
        count: z.string().transform(Number),
        rawTitle: z.string(),
        source: z.string().default("web"),
      })
      .transform(({ count, rawTitle, source }) => ({
        count,
        source,
        title: rawTitle,
      }));
    const scrape = defineScraper({
      extract: {
        count: { selector: "span", value: (node) => node.text() },
        rawTitle: text("title"),
      },
      schema,
    });
    expectTypeOf(scrape).toEqualTypeOf<
      Scraper<{ count: number; source: string; title: string }>
    >();
  });

  test("independent synchronous and asynchronous transform outputs are inferred", () => {
    const config = {
      extract: { title: text("title") },
      schema: z.object({ title: z.string() }),
    };
    const project = defineScraper({
      ...config,
      transform: ({ title }) => ({ slug: title }),
    });
    const asyncProject = defineScraper({
      ...config,
      transform: async ({ title }) => {
        await Promise.resolve();
        return title.length;
      },
    });
    const nothing = defineScraper({
      ...config,
      transform: (): undefined => {},
    });
    expectTypeOf(project).toEqualTypeOf<Scraper<{ slug: string }>>();
    expectTypeOf(asyncProject).toEqualTypeOf<Scraper<number>>();
    expectTypeOf(nothing).toEqualTypeOf<Scraper<undefined>>();
  });

  test("optional transform configs return the honest union of possible outputs", () => {
    const schema = z.object({ title: z.string() });
    const config: ScraperConfig<typeof schema, number> = {
      extract: { title: "title" },
      schema,
    };
    const scrape = defineScraper(config);
    expectTypeOf(scrape).toEqualTypeOf<Scraper<{ title: string } | number>>();
  });

  test("explicit generics cannot claim a transform result without a transform", () => {
    const schema = z.object({ title: z.string() });
    const scrape = defineScraper<typeof schema, number>({
      extract: { title: "title" },
      schema,
    });
    expectTypeOf(scrape).toEqualTypeOf<Scraper<{ title: string } | number>>();
  });

  test("helpers support readonly arrays, optional nested inputs, and coercion", () => {
    const schema = z.object({
      image: z.object({ url: z.string() }).optional(),
      links: z.array(z.string()).readonly(),
      products: z.array(
        z.object({ name: z.string(), price: z.coerce.number() })
      ),
    });
    const scrape = defineScraper({
      extract: {
        image: nested("head", { url: attr("meta", "content") }),
        links: many(attr("a", "href")),
        products: many("article", { name: text("h2"), price: text("span") }),
      },
      schema,
    });
    expectTypeOf(scrape).toEqualTypeOf<Scraper<z.output<typeof schema>>>();
  });

  test("unknown preprocess input accepts an open extraction map", () => {
    const schema = z.preprocess(
      (value) => value,
      z.object({ title: z.string() })
    );
    const scrape = defineScraper({ extract: { title: text("title") }, schema });
    expectTypeOf(scrape).toEqualTypeOf<Scraper<{ title: string }>>();
  });

  test("known input shapes reject typos, missing required fields and incorrect callback values", () => {
    // @ts-expect-error missing a required schema input field
    const missing: ExtractConfig<{ title: string }> = {};
    // @ts-expect-error misspelled input key
    const typo: ExtractConfig<{ title?: string }> = { titel: "title" };
    const wrongCallback: ExtractConfig<{ count: string }> = {
      // @ts-expect-error callback must produce schema input, not schema output
      count: { selector: "span", value: () => 42 },
    };
    const wrongArray: ExtractConfig<{ title: string }> = {
      // @ts-expect-error arrays cannot target a known scalar input
      title: many("title"),
    };
    const asyncCallback: ExtractConfig<{ title: string }> = {
      title: {
        selector: "title",
        // @ts-expect-error direct async extractors are not valid string callbacks
        value: async () => {
          await Promise.resolve();
          return "title";
        },
      },
    };
    expectTypeOf(missing).toBeObject();
    expectTypeOf(typo).toBeObject();
    expectTypeOf(wrongCallback).toBeObject();
    expectTypeOf(wrongArray).toBeObject();
    expectTypeOf(asyncCallback).toBeObject();
  });

  test("success and failure narrow without inspecting arbitrary values", async () => {
    const scrape = defineScraper({
      extract: { title: "title" },
      schema: z.object({ title: z.string() }),
    });
    const result = await scrape("<title>Example</title>");
    if (result.ok) {
      expectTypeOf(result.data).toEqualTypeOf<{ title: string }>();
      expectTypeOf(result.error).toEqualTypeOf<undefined>();
    } else {
      expectTypeOf(result.error.stage).toEqualTypeOf<
        "extract" | "validate" | "transform"
      >();
      if (result.error.code === "VALIDATION_FAILED") {
        expectTypeOf(result.error.issues).items.toHaveProperty("message");
      }
    }
  });
});
