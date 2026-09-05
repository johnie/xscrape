# Missing data

Missing scalar matches produce `undefined`; missing collections produce `[]`. Callbacks are skipped for absent nodes, so callback fallbacks cannot replace schema defaults. Empty text is not a missing value.

<!-- example: missing-data -->

```typescript
import { attr, defineScraper, many, text } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: {
    author: attr('meta[name="author"]', "content"),
    links: many(attr("a", "href")),
    title: text("title"),
    // source can be omitted because the schema input makes it optional.
  },
  schema: z.object({
    author: z.string().optional(),
    links: z.array(z.string()),
    source: z.string().default("web"),
    title: z.string().default("Untitled"),
  }),
});

export const result = await scrape("<body>No metadata</body>");
// Success data: { author: undefined, links: [], source: "web", title: "Untitled" }
// Defaults handle undefined, not empty text or a present but malformed value.
```

<!-- /example -->
