---
outline: deep
---

# `defineScraper(config)`

Creates a scraper:

- `schema: S` — Standard-Schema-compatible
- `extract: Record<string, ExtractDescriptor | [ExtractDescriptor]>`
- `transform?: (data) => R | Promise<R>`

Returns `(html: string) => Promise<{ data?: R; error?: unknown }>`.

See types in [types.md](/api/types).
