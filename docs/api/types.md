---
outline: deep
---

# Types

```ts
type ScraperResult<T> = { data?: T; error?: unknown };
interface ScraperConfig<S, R> {
  schema: S;
  extract: ExtractConfig<InferOutput<S>>;
  transform?: (data: InferOutput<S>) => R | Promise<R>;
}
```

Imported from:

- `@/index.ts`
- `@/types/main.ts`
- `@/types/extract.ts`
