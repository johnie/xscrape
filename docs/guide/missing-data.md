---
outline: deep
---

# Handling Missing Data

Define defaults in your schema:

```ts
const scraper = defineScraper({
  schema: z.object({
    title: z.string().default("Untitled"),
    views: z.coerce.number().default(0),
  }),
  extract: {
    title: { selector: "title" },
    views: { selector: 'meta[name="views"]', value: "content" },
  },
});
```
