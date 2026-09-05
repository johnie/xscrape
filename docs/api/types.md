# Types

Import public types from `xscrape`, never from internal source aliases.

```ts
import type {
  ExtractConfig,
  ExtractNode,
  ParsedHtml,
  Scraper,
  ScraperConfig,
  ScraperDiagnostic,
  ScraperError,
  ScraperResult,
} from "xscrape";
```

`Scraper<T>` accepts `string | ParsedHtml` and returns `Promise<ScraperResult<T>>`.

`ScraperResult<T>` discriminates on `ok`. Success contains `data: T`; failure contains `error: ScraperError`. Opposite-branch properties are optional `never`, so destructuring remains possible without permitting both values.

`ScraperConfig<S, R>` uses `ExtractConfig<StandardSchemaV1.InferInput<S>>`. Its optional transform maps `StandardSchemaV1.InferOutput<S>` to `R | Promise<R>`.

`ExtractConfig<T>` preserves known input keys and their optionality. Unknown and preprocessed inputs have no statically knowable keys and use an open extraction map. Selectors cannot prove that a node exists or that extracted text matches a schema; runtime validation remains authoritative.

`ExtractNode` exposes read-only functions `attr(name)`, `text()`, and `html()`. It does not expose DOM mutation, selectors, or raw Cheerio objects.

`ExtractedRecord` is `Record<string, unknown>` because extraction happens before validation. Callback values may include Dates or other non-JSON objects. A callback's sibling record is read-only and only partially populated.

`ParsedHtml` is opaque. Create it with `parseHtml`, not an assertion or object literal.
