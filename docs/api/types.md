---
outline: deep
---

# Types

```ts
type ScraperResult<T> = { data?: T; error?: unknown };
interface ScraperConfig<S, R> {
  schema: S;
  extract: ExtractConfig;
  transform?: (data: InferOutput<S>) => R | Promise<R>;
}
```

Imported from:

- `@/defineScraper.ts`
- `@/types/main.ts`
- `@/types/cheerio.ts`
