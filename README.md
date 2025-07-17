<p align="center">

  <h1 align="center">🕷️<br/><code>xscrape</code></h1>
  <p align="center">Extract and transform HTML with your own schema, powered by <code>Standard Schema</code> compatibility.
    <br/>
    by <a href="https://github.com/johnie">@johnie</a>
  </p>
</p>
<br/>

<p align="center">
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/johnie/xscrape" alt="License"></a>
<a href="https://www.npmjs.com/package/xscrape" rel="nofollow"><img src="https://img.shields.io/npm/v/xscrape.svg" alt="npm"></a>
<a href="https://github.com/johnie/xscrape/actions"><img src="https://github.com/johnie/xscrape/actions/workflows/ci/badge.svg" alt="Build Status"></a>
<a href="https://github.com/johnie/xscrape" rel="nofollow"><img src="https://img.shields.io/github/stars/johnie/xscrape" alt="stars"></a>
</p>

<br/>
<br/>

## Overview

xscrape is a powerful HTML scraping library that combines the flexibility of query selectors with the safety of schema validation. It works with any validation library that implements the [Standard Schema](https://standardschema.dev) specification, including Zod, Valibot, ArkType, and Effect Schema.

## Features

- **HTML Parsing**: Extract data from HTML using query selectors powered by [cheerio](https://github.com/cheeriojs/cheerio)
- **Universal Schema Support**: Works with any [Standard Schema](https://standardschema.dev) compatible library
- **Type Safety**: Full TypeScript support with inferred types from your schemas
- **Flexible Extraction**: Support for nested objects, arrays, and custom transformation functions
- **Error Handling**: Comprehensive error handling with detailed validation feedback
- **Custom Transformations**: Apply post-processing transformations to validated data
- **Default Values**: Handle missing data gracefully through schema defaults

## Installation

Install xscrape with your preferred package manager:

```bash
npm install xscrape
# or
pnpm add xscrape
# or
bun add xscrape
```

## Quick Start

```typescript
import { defineScraper } from 'xscrape';
import { z } from 'zod';

// Define your schema
const schema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  views: z.coerce.number(),
});

// Create a scraper
const scraper = defineScraper({
  schema,
  extract: {
    title: { selector: 'title' },
    description: { selector: 'meta[name="description"]', value: 'content' },
    keywords: {
      selector: 'meta[name="keywords"]',
      value: (el) => el.attribs['content']?.split(',') || [],
    },
    views: { selector: 'meta[name="views"]', value: 'content' },
  },
});

// Use the scraper
const { data, error } = await scraper(htmlString);
```

## Usage Examples

### Basic Extraction

Extract basic metadata from an HTML page:

```typescript
import { defineScraper } from 'xscrape';
import { z } from 'zod';

const scraper = defineScraper({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
  }),
  extract: {
    title: { selector: 'title' },
    description: { selector: 'meta[name="description"]', value: 'content' },
    author: { selector: 'meta[name="author"]', value: 'content' },
  },
});

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>My Blog Post</title>
  <meta name="description" content="An interesting blog post">
  <meta name="author" content="John Doe">
</head>
<body>...</body>
</html>
`;

const { data, error } = await scraper(html);
// data: { title: "My Blog Post", description: "An interesting blog post", author: "John Doe" }
```

### Handling Missing Data

Use schema defaults to handle missing data gracefully:

```typescript
const scraper = defineScraper({
  schema: z.object({
    title: z.string().default('Untitled'),
    description: z.string().default('No description available'),
    publishedAt: z.string().optional(),
    views: z.coerce.number().default(0),
  }),
  extract: {
    title: { selector: 'title' },
    description: { selector: 'meta[name="description"]', value: 'content' },
    publishedAt: { selector: 'meta[name="published"]', value: 'content' },
    views: { selector: 'meta[name="views"]', value: 'content' },
  },
});

// Even with incomplete HTML, you get sensible defaults
const { data } = await scraper('<html><head><title>Test</title></head></html>');
// data: { title: "Test", description: "No description available", views: 0 }
```

### Extracting Arrays

Extract multiple elements as arrays:

```typescript
const scraper = defineScraper({
  schema: z.object({
    links: z.array(z.string()),
    headings: z.array(z.string()),
  }),
  extract: {
    links: [{ selector: 'a', value: 'href' }],
    headings: [{ selector: 'h1, h2, h3' }],
  },
});

const html = `
<html>
<body>
  <h1>Main Title</h1>
  <h2>Subtitle</h2>
  <a href="/page1">Link 1</a>
  <a href="/page2">Link 2</a>
</body>
</html>
`;

const { data } = await scraper(html);
// data: {
//   links: ["/page1", "/page2"],
//   headings: ["Main Title", "Subtitle"]
// }
```

### Nested Objects

Extract complex nested data structures:

```typescript
const scraper = defineScraper({
  schema: z.object({
    title: z.string(),
    socialMedia: z.object({
      image: z.string().url(),
      width: z.coerce.number(),
      height: z.coerce.number(),
      type: z.string(),
    }),
  }),
  extract: {
    title: { selector: 'title' },
    socialMedia: {
      selector: 'head',
      value: {
        image: { selector: 'meta[property="og:image"]', value: 'content' },
        width: { selector: 'meta[property="og:image:width"]', value: 'content' },
        height: { selector: 'meta[property="og:image:height"]', value: 'content' },
        type: { selector: 'meta[property="og:type"]', value: 'content' },
      },
    },
  },
});
```

### Custom Value Transformations

Apply custom logic to extracted values:

```typescript
const scraper = defineScraper({
  schema: z.object({
    tags: z.array(z.string()),
    publishedDate: z.date(),
    readingTime: z.number(),
  }),
  extract: {
    tags: {
      selector: 'meta[name="keywords"]',
      value: (el) => el.attribs['content']?.split(',').map(tag => tag.trim()) || [],
    },
    publishedDate: {
      selector: 'meta[name="published"]',
      value: (el) => new Date(el.attribs['content']),
    },
    readingTime: {
      selector: 'article',
      value: (el) => {
        const text = el.text();
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
      },
    },
  },
});
```

### Post-Processing with Transform

Apply transformations to the validated data:

```typescript
const scraper = defineScraper({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
  extract: {
    title: { selector: 'title' },
    description: { selector: 'meta[name="description"]', value: 'content' },
    tags: {
      selector: 'meta[name="keywords"]',
      value: (el) => el.attribs['content']?.split(',') || [],
    },
  },
  transform: (data) => ({
    ...data,
    slug: data.title.toLowerCase().replace(/\s+/g, '-'),
    tagCount: data.tags.length,
    summary: data.description.substring(0, 100) + '...',
  }),
});
```

## Schema Library Examples

### Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  price: z.coerce.number(),
  inStock: z.boolean().default(false),
});
```

### Valibot

```typescript
import * as v from 'valibot';

const schema = v.object({
  title: v.string(),
  price: v.pipe(v.string(), v.transform(Number)),
  inStock: v.optional(v.boolean(), false),
});
```

### ArkType

```typescript
import { type } from 'arktype';

const schema = type({
  title: 'string',
  price: 'number',
  inStock: 'boolean = false',
});
```

### Effect Schema

```typescript
import { Schema } from 'effect';

const schema = Schema.Struct({
  title: Schema.String,
  price: Schema.NumberFromString,
  inStock: Schema.optionalWith(Schema.Boolean, { default: () => false }),
});
```

## API Reference

### `defineScraper(config)`

Creates a scraper function with the specified configuration.

#### Parameters

- `config.schema`: A Standard Schema compatible schema object
- `config.extract`: Extraction configuration object
- `config.transform?`: Optional post-processing function

#### Returns

A scraper function that takes HTML string and returns `Promise<{ data?: T, error?: unknown }>`.

### Extraction Configuration

The `extract` object defines how to extract data from HTML:

```typescript
type ExtractConfig = {
  [key: string]: ExtractDescriptor | [ExtractDescriptor];
};

type ExtractDescriptor = {
  selector: string;
  value?: string | ((el: Element) => any) | ExtractConfig;
};
```

#### Properties

- `selector`: CSS selector to find elements
- `value`: How to extract the value:
  - `string`: Attribute name (e.g., `'href'`, `'content'`)
  - `function`: Custom extraction function
  - `object`: Nested extraction configuration
  - `undefined`: Extract text content

#### Array Extraction

Wrap the descriptor in an array to extract multiple elements:

```typescript
{
  links: [{ selector: 'a', value: 'href' }]
}
```

## Error Handling

xscrape provides comprehensive error handling:

```typescript
const { data, error } = await scraper(html);

if (error) {
  // Handle validation errors, extraction errors, or transform errors
  console.error('Scraping failed:', error);
} else {
  // Use the validated data
  console.log('Extracted data:', data);
}
```

## Best Practices

1. **Use Specific Selectors**: Be as specific as possible with CSS selectors to avoid unexpected matches
2. **Handle Missing Data**: Use schema defaults or optional fields for data that might not be present
3. **Validate URLs**: Use URL validation in your schema for href attributes
4. **Transform Data Early**: Use custom value functions rather than post-processing when possible
5. **Type Safety**: Let TypeScript infer types from your schema for better developer experience

## Common Use Cases

- **Web Scraping**: Extract structured data from websites
- **Meta Tag Extraction**: Get social media and SEO metadata
- **Content Migration**: Transform HTML content to structured data
- **Testing**: Validate HTML structure in tests
- **RSS/Feed Processing**: Extract article data from HTML feeds

## Performance Considerations

- xscrape uses cheerio for fast HTML parsing
- Schema validation is performed once after extraction
- Consider using streaming for large HTML documents
- Cache scrapers when processing many similar documents

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/johnie/xscrape/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See the [LICENSE](https://github.com/johnie/xscrape/blob/main/LICENSE) file for details.

## Related Projects

- [cheerio](https://github.com/cheeriojs/cheerio) - jQuery-like server-side HTML parsing
- [Standard Schema](https://standardschema.dev) - Universal schema specification
- [Zod](https://zod.dev) - TypeScript-first schema validation
- [Valibot](https://valibot.dev) - Modular and type-safe schema library
- [Effect](https://effect.website) - Maximum Type-safety (incl. error handling)
- [ArkType](https://arktype.io) - TypeScript's 1:1 validator, optimized from editor to runtime
