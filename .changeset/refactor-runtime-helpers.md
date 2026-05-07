---
"xscrape": patch
---

Internal cleanup with no public API changes.

- Refactor `src/internal/runtime.ts` for clarity: collapse `transformValidatedData`, split `compileExtractDescriptor` into a shape function plus a `compileDescriptorValue` helper, and inline the single-call `compileArrayItem` into `compileExtractField`
- Bump dev dependencies: `tsdown` 0.21 → 0.22, `valibot` 1.3 → 1.4, `vite` 8.0.10 → 8.0.11
- Bump `packageManager` to `pnpm@11.0.8`
