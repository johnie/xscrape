# Quick start

Install `xscrape` and a Standard Schema validation library. This example uses Zod.

<!-- example: quick-start -->

```typescript
import { attr, defineScraper, text, toDiagnostic } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: {
    description: attr('meta[name="description"]', "content"),
    title: text("title"),
    views: attr('meta[name="views"]', "content"),
  },
  schema: z.object({
    description: z.string().default("No description"),
    title: z.string(),
    views: z.coerce.number(),
  }),
});

export const result = await scrape(`
  <title>Example</title>
  <meta name="views" content="42">
`);

// Success data: { description: "No description", title: "Example", views: 42 }
if (result.ok) {
  console.log(result.data);
} else {
  console.error(toDiagnostic(result.error));
}
```

<!-- /example -->

The scraper consumes an HTML string, not a URL. Fetching and browser rendering belong to the caller.
