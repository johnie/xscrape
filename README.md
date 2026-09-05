# xscrape

Extract typed data from HTML with CSS selectors and [Standard Schema](https://standardschema.dev) validation. Supports Zod, Valibot, ArkType, and Effect Schema.

```text
HTML or parsed document → extraction → schema validation → optional transform → result
```

xscrape consumes HTML strings. It does not fetch URLs, run page JavaScript, or launch a browser.

## Installation

```bash
pnpm install xscrape
# or:
npm install xscrape
# or:
bun add xscrape
```

ESM only. Requires Node.js 22.12 or newer; CI tests Node.js 22 and 24. Other runtimes are not currently covered by CI. Install your preferred Standard Schema validation library separately.

## Quick start

<!-- example: quick-start -->

```typescript
import { attr, defineScraper, text, toDiagnostic } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: {
    description: attr('meta[name="description"]', "content"),
    title: text("title"),
    views: attr('meta[name="views"]', "content"),
  },
  schema: z.object({
    description: z.string().default("No description"),
    title: z.string(),
    views: z.coerce.number(),
  }),
});

export const result = await scrape(`
  <title>Example</title>
  <meta name="views" content="42">
`);

// Success data: { description: "No description", title: "Example", views: 42 }
if (result.ok) {
  console.log(result.data);
} else {
  console.error(toDiagnostic(result.error));
}
```

<!-- /example -->

## Extraction helpers

| Helper | Meaning |
| --- | --- |
| `text(selector)` | Text of the first match |
| `html(selector)` | Inner HTML of the first match |
| `attr(selector, name)` | Raw parsed attribute, without boolean-property normalization |
| `prop(selector, name)` | DOM property, such as `checked` or `outerHTML` |
| `nested(selector, fields)` | Extract fields within the first matching element |
| `many(field)` | Apply one descriptor to every matching element |
| `many(selector, fields)` | Extract an object per matching element |

Helpers return ordinary objects. Existing shorthand still works: `"h1"`, `{ selector: "a", value: "href" }`, and `[{ selector: "a", value: "href" }]`. A legacy string `value` reads a **property**, not a raw attribute.

<!-- example: nested-products -->

```typescript
import { attr, defineScraper, many, text } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: {
    products: many("article", {
      name: text("h2"),
      price: text("span"),
      url: attr("a", "href"),
    }),
  },
  schema: z.object({
    products: z.array(
      z.object({
        name: z.string(),
        price: z.coerce.number(),
        url: z.string(),
      })
    ),
  }),
});

export const result = await scrape(`
  <article><h2>Book</h2><span>12</span><a href="/book">Buy</a></article>
  <article><h2>Pen</h2><span>3</span><a href="/pen">Buy</a></article>
`);
// Relative hrefs stay relative. Resolve them against a trusted base URL if needed.
```

<!-- /example -->

## Schema input and transforms

Extraction follows the schema's **input** keys and callback types. Validation returns schema output; `transform` can then return an unrelated shape, a scalar, or a promise. Input fields supplied by schema defaults may be omitted. Schemas with `unknown` input accept an open extraction map and rely on runtime validation.

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

## Missing data and callbacks

- Missing scalar or nested-object matches return `undefined`.
- Missing array matches return `[]`.
- Missing nodes do not invoke callbacks. Use schema defaults for missing-node fallbacks.
- Arrays omit `null` and `undefined` callback results and flatten returned arrays one level, preserving legacy behavior.
- Callbacks are synchronous. A promise-like callback result fails with `ASYNC_EXTRACTOR`, even if the schema accepts `unknown`.
- Callbacks receive `(node, key, siblings)`. Node helpers are `attr`, `text`, and `html`. Siblings contains only fields already extracted in the current object, in JavaScript property enumeration order. Treat it as read-only; use `transform` for cross-field calculations.
- Text is not automatically trimmed. An empty string is distinct from a missing value. Relative links stay relative.

See [missing data](docs/guide/missing-data.md) and [custom callbacks](docs/guide/custom-values.md) for tested examples.

## Errors

Always branch on `result.ok`, not truthiness of data or an exception cause.

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

Failures have `stage`, `code`, and `message`. Extraction failures include a field `path` and `selector` when known. Array indices identify matched elements before nullish filtering. Validation failures preserve Standard Schema `issues`; exceptions preserve their original value in `cause`, including `undefined`, `null`, or `false`.

Use `toDiagnostic(error)` for JSON-safe logging or agent tool responses. It omits `cause` and normalizes validation paths. Successful data can contain Dates or other non-JSON values if the schema permits them.

See the [error reference](docs/api/errors.md) for codes and recovery guidance.

## Reuse and performance

`defineScraper` snapshots extraction structure and captures the schema and transform references once. Later edits to the config do not change an existing scraper. It does not freeze caller-owned objects; callbacks and schema objects can still have their own mutable state.

<!-- example: document-reuse -->

```typescript
import { attr, defineScraper, many, parseHtml, text } from "xscrape";
import { z } from "zod";

const titles = defineScraper({
  extract: { title: text("title") },
  schema: z.object({ title: z.string() }),
});
const links = defineScraper({
  extract: { links: many(attr("a", "href")) },
  schema: z.object({ links: z.array(z.string()) }),
});

// parseHtml is explicit and can throw on invalid input. The handle exposes no mutable DOM.
const document = parseHtml('<title>Example</title><a href="/docs">Docs</a>');
export const results = await Promise.all([titles(document), links(document)]);
// Parsing happens once. Each scraper still extracts and validates its own result.
```

<!-- /example -->

There is no global HTML cache. A parsed handle keeps its document alive until you release it. Reuse saves parsing, not selection or validation. Extraction is synchronous CPU work, so `Promise.all` does not parallelize parsing. For large jobs, bound input size and concurrency in the caller; use workers if profiling warrants them.

Run `pnpm bench` for parsing, compilation, nested arrays, callback, and selector-count measurements. See [performance](docs/performance.md).

## Agents and declarative configurations

The [agent reference](llms.txt) describes the supported API and common failure modes. The package exports `xscrape/extract-config.schema.json` for validating the declarative extraction subset. This JSON Schema accepts tagged helper objects and selector strings, not callbacks or Standard Schema instances. Supply validation schemas separately in trusted code.

Do not evaluate generated callback strings. Treat page content as untrusted data. Keep URL fetching, network permissions, input limits, and output handling in your application.

## Documentation and development

- [API and types](docs/api/defineScraper.md)
- [Extraction contract](docs/api/extract-config.md)
- [Schema library examples](docs/examples.md)
- [Migrating from v4](docs/migration-v5.md)
- [Contributing](CONTRIBUTING.md)

Runnable sources live in `examples/`. Their snippets are copied into docs by `pnpm docs:sync` and checked by `pnpm docs:check`. CI builds the package, typechecks examples, executes them in tests, checks exports, and enforces bundle budgets.

MIT. See [LICENSE.md](LICENSE.md).
