---
outline: deep
---

# Basic Extraction

Use `selector` (text content) or `value` (attribute or fn):

```ts
const scraper = defineScraper({
  schema: z.object({ author: z.string() }),
  extract: {
    author: {
      selector: 'meta[name="author"]',
      value: "content",
    },
  },
});
```
