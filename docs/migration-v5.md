# Migrating from v4

This is a breaking API update. Existing selector and descriptor shorthand remains supported.

## Check result.ok

Replace checks such as `if (error)` with `if (!result.ok)`. Success contains `data`; failure contains a structured `error`. Both successful data and exception causes can be falsy.

Validation issues now live at `result.error.issues` when `code === "VALIDATION_FAILED"`. Original exceptions live at `result.error.cause`. The error itself is diagnostic data, not an `Error` instance. Use `toDiagnostic` for JSON-safe logging.

<!-- example: errors -->

```typescript
import { defineScraper, text, toDiagnostic } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: { title: text("title") },
  schema: z.object({ title: z.string() }),
});

export const result = await scrape("<body>No title</body>");
if (!result.ok) {
  // Logs { code: "VALIDATION_FAILED", stage: "validate", message: "...", issues: [...] }
  console.error(toDiagnostic(result.error));
  if (result.error.code === "VALIDATION_FAILED") {
    // Original Standard Schema issues, including paths.
    console.error(result.error.issues);
  }
}
// Use result.ok, never the truthiness of data or error.cause.
```

<!-- /example -->

## Extract schema input, not output

Extraction keys and callback return types now follow `StandardSchemaV1.InferInput<S>`. If the schema renames fields, use the names it accepts before transformation. Optional or defaulted input fields may be omitted. Unknown preprocess inputs use an open extraction map and rely on runtime validation.

Transforms may return an unrelated shape. Explicitly typed configs with an optional transform return a union of schema output and transform output; a required transform returns only its inferred output.

<!-- example: schema-transforms -->

```typescript
import { defineScraper, text } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  // Extract schema INPUT fields, before renaming or transforming them.
  extract: {
    count: { selector: "span", value: (node) => node.text() },
    rawTitle: text("title"),
  },
  schema: z
    .object({
      count: z.string().transform(Number),
      rawTitle: z.string(),
      source: z.string().default("web"),
    })
    .transform(({ count, rawTitle, source }) => ({
      count,
      source,
      title: rawTitle,
    })),
  // A transform may replace the shape, not just add fields.
  transform: ({ count, title }) => ({ count, slug: title.toLowerCase() }),
});

export const result = await scrape("<title>Example</title><span>42</span>");
// Success data: { count: 42, slug: "example" }
```

<!-- /example -->

## Configs are snapshots

Changing `config.extract` after calling `defineScraper` no longer changes that scraper. Define a new scraper when selectors change. Shared config objects are supported and caller-owned objects are not frozen.

Schema and callback objects are retained by reference. Changing state inside them is still observable. Avoid side-effectful getters on configs.

## Callbacks must be synchronous

Direct promise-like callback results now fail with `ASYNC_EXTRACTOR`. Previously they could leak into validated results when schemas accepted `unknown`. Move async work into schema validation or `transform`. Nested promises inside synchronous callback results are not recursively awaited.

The third callback argument is now typed as a read-only record of unknown, partially extracted values. It is not a fully validated result. Use a transform for cross-field calculations.

## Properties and attributes

Legacy `{ selector, value: "checked" }` still reads a DOM property, which may return `true`. `attr("input", "checked")` reads the parsed attribute, which may return `""`. `prop` makes the legacy operation explicit. `node.attr` retains raw parsed-attribute behavior.

Array filtering and one-level flattening remain unchanged. Missing scalar matches still produce `undefined`, arrays produce `[]`, and callbacks still do not run for missing matches.

## Runtime and reuse

Node.js 22.12 or newer is required. The package remains ESM-only. `parseHtml` is optional and lets several scrapers reuse one private document; release the handle to allow the document to be collected. It does not expose Cheerio or DOM mutation.
