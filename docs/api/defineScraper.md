# defineScraper

```ts
import { defineScraper } from "xscrape";
```

`defineScraper({ extract, schema, transform? })` returns a reusable async scraper accepting an HTML string or a `ParsedHtml` handle.

- `schema` implements Standard Schema v1. Both synchronous and asynchronous validation work.
- `extract` targets schema input keys. Callback results target input types, not transformed output types. Optional and defaulted input fields may be omitted. Unknown inputs fall back to an open map.
- `transform` receives validated schema output and may return any result or a promise. Without it, the scraper returns schema output. A config with an optional transform returns the union of the two possible output types.
- Results are `{ ok: true, data }` or `{ ok: false, error }`. Scraper calls report parsing, extraction, validation, and transform failures without rejecting for those failures.

Configuration structure is copied when defining the scraper. Invalid extraction configurations are reported as `INVALID_CONFIG` when the returned scraper runs. Selectors are evaluated against a document at execution time. Nested selectors that are never reached cannot produce selector errors.

Schema and callback objects are retained by reference. Their internal state is not cloned or frozen. Do not pass configuration objects with side-effectful getters.

See [types](types.md), [errors](errors.md), and [extraction](extract-config.md).
