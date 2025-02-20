# xscrape

`xscrape` is a powerful and flexible library designed for extracting and transforming data from HTML documents using user-defined schemas. 

## Features

- **HTML Parsing**: Extract data from HTML using CSS selectors with the help of
  [cheerio](https://github.com/cheeriojs/cheerio).
- **Schema Validation**: Validate and transform extracted data with schema validation libraries like [Zod](https://github.com/colinhacks/zod).
- **Custom Transformations**: Provide custom transformations for extractedattributes.
- **Default Values**: Define default values for missing data fields.
- **Nested Field Support**: Define and extract nested data structures from
  HTML elements.

### Schema Support

| Schema Library                                       | Status              | Notes                                                         |
| ---------------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| [Zod](https://github.com/colinhacks/zod)             | ✅ Supported        | Default schema tool for `xscrape`                             |
| [Effect/Schema](https://github.com/Effect-TS/effect) | 🔄 In Consideration        | Support for Effect/Schema for additional flexibility          |
| [Joi](https://github.com/sideway/joi)                | 🔄 In Consideration        | Support for Joi for validation                                |
| [Yup](https://github.com/jquense/yup)                | 🔄 In Consideration        | Support for Yup for validation                                |
| Others...                                            | 🔄 In Consideration | Potential support for other schema tools as per user feedback |

## Installation

To install this library, use npm or yarn:

```bash
pnpm add xscrape
# or
npm install xscrape
```

## Usage

Below is an example of how to use xscrape for extracting and transforming data from an HTML document:

```ts
import { defineScraper } from 'xscrape';

const scraper = defineScraper({
  validator: 'zod',
  schema: (z) => z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    views: z.coerce.number(),
  }),
  extract: {
    title: {
      selector: 'title',
    },
    description: {
      selector: 'meta[name="description"]',
      value: 'content',
    },
    keywords: {
      selector: 'meta[name="keywords"]',
      value(el) {
        return el.attribs['content']?.split(',');
      },
    },
    views: {
      selector: 'meta[name="views"]',
      value: 'content',
    },
  },
});

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="description" content="An example description.">
  <meta name="keywords" content="typescript,html,parsing">
  <meta name="views" content="1234">
  <title>Example Title</title>
</head>
<body></body>
</html>
`;

const { data, error } = await scraper(html);
console.log(data);

// Outputs:
// {
//   title: 'Example Title',
//   description: 'An example description.',
//   keywords: ['typescript', 'html', 'parsing'],
//   views: 1234
// }
```

### Handling Missing Data

xscrape supports default values through Zod's schema definitions:

```ts
const scraper = defineScraper({
  validator: 'zod',
  schema: (z) => z.object({
    title: z.string().default('No title'),
    description: z.string().default('No description'),
    views: z.coerce.number().default(0),
  }),
  extract: {
    title: {
      selector: 'title',
    },
    description: {
      selector: 'meta[name="description"]',
      value: 'content',
    },
    views: {
      selector: 'meta[name="views"]',
      value: 'content',
    },
  },
});
```

### Nested Fields

xscrape supports extracting nested data structures:

```ts
const scraper = defineScraper({
  validator: 'zod',
  schema: (z) => z.object({
    title: z.string(),
    image: z.object({
      url: z.string().url(),
      width: z.coerce.number(),
      height: z.coerce.number(),
    }).default({ url: '', width: 0, height: 0 }).optional(),
  }),
  extract: {
    title: {
      selector: 'title',
    },
    image: {
      selector: 'head',
      value: {
        url: {
          selector: 'meta[property="og:image"]',
          value: 'content',
        },
        width: {
          selector: 'meta[property="og:image:width"]',
          value: 'content',
        },
        height: {
          selector: 'meta[property="og:image:height"]',
          value: 'content',
        },
      },
    },
  },
});
```

## Configuration

xscrape offers a range of configuration options through the types provided, allowing for detailed customization and robust data extraction and validation:

- `schema`: Defines the shape and validation rules for the extracted data
- `extract`: Determines how fields are extracted from the HTML
- `validator`: Specifies the validation library to use (currently supports 'zod')

## Contributing

Contributions are welcome! Please see the Contributing Guide https://github.com/johnie/xscrape/blob/main/CONTRIBUTING.md for more information.

## License

This project is licensed under the MIT License. See the LICENSE
https://github.com/johnie/xscrape/blob/main/LICENSE file for details.
