---
outline: deep
---

# Quick Start

```ts
import { defineScraper } from 'xscrape'
import { z } from 'zod'

const schema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  views: z.coerce.number(),
})

const scraper = defineScraper({
  schema,
  extract: {
    title: { selector: 'title' },
    description: { selector: 'meta[name="description"]', value: 'content' },
    keywords: {
      selector: 'meta[name="keywords"]',
      value: el => el.attribs.content?.split(',') || []
    },
    views: { selector: 'meta[name="views"]', value: 'content' },
  },
})

const html = /* your HTML string */
const { data, error } = await scraper(html)
```

- **data**: validated result
- **error**: validation or extraction errors
