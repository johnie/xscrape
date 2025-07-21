---
outline: deep
---

# Custom Transform

Post-process your data:

```ts
defineScraper({
  schema: z.object({ title: z.string() }),
  extract: { title: { selector: "title" } },
  transform(data) {
    return { slug: data.title.toLowerCase().replace(/\s+/g, "-") };
  },
});
```
