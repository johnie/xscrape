# Post-validation transforms

The transform receives schema output. It can replace the object, return a scalar, or perform asynchronous work. An exception becomes `TRANSFORM_FAILED`; it does not reject the scraper call.

<!-- example: schema-transforms -->

```typescript
import { defineScraper, text } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  // Extract schema INPUT fields, before renaming or transforming them.
  extract: {
    count: { selector: "span", value: (node) => node.text() },
    rawTitle: text("title"),
  },
  schema: z
    .object({
      count: z.string().transform(Number),
      rawTitle: z.string(),
      source: z.string().default("web"),
    })
    .transform(({ count, rawTitle, source }) => ({
      count,
      source,
      title: rawTitle,
    })),
  // A transform may replace the shape, not just add fields.
  transform: ({ count, title }) => ({ count, slug: title.toLowerCase() }),
});

export const result = await scrape("<title>Example</title><span>42</span>");
// Success data: { count: 42, slug: "example" }
```

<!-- /example -->
