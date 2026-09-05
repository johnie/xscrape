# Performance

The runtime normalizes extraction structure once per `defineScraper` call. Compiled plans do not contain documents, and separate invocations do not share a mutable current document.

HTML parsing and selector traversal usually matter more than normalization. `bench/extraction.bench.ts` measures these separately across document sizes, nested arrays, callbacks, and selector counts. The direct Cheerio comparison excludes schema validation and is not an equivalent end-to-end API.

```bash
pnpm bench
```

Record the Node version, CPU, document size, field count, and benchmark options when comparing results. Warm synthetic benchmarks are useful for regression detection, not production throughput guarantees. Do not infer improvements from one run; repeat measurements on representative pages.

## Reuse parsing deliberately

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

A `ParsedHtml` handle stores a private Cheerio document. Multiple scrapers can read it without parsing again. Each still performs its own extraction and validation. Reuse across concurrent async validations is supported; extraction itself is synchronous.

There is no global HTML cache or result cache. Retaining a handle retains the DOM. Release handles when finished, bound the size of externally supplied HTML, and keep batch concurrency under caller control. `Promise.all` does not parallelize synchronous parsing or selection; CPU-heavy workloads may need worker threads.

The default HTML parser is unchanged. Changing parsers or using streaming can change malformed-HTML behavior and arbitrary selector support, so neither is silently substituted as an optimization.
