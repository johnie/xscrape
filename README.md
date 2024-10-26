# xscrape

`xscrape` is a powerful and flexible library designed for extracting and
transforming data from HTML documents using user-defined schemas. It integrates
seamlessly with various schema validation libraries such as Zod, Yup, Joi, and
Effect Schema, allowing you to use your preferred validation tool.

## Features

- HTML Parsing: Extract data from HTML using CSS selectors with the help of
  [cheerio](https://github.com/cheeriojs/cheerio).
- Schema Validation: Validate and transform extracted data with schema validation libraries like [Zod](https://github.com/colinhacks/zod).
- Custom Transformations: Provide custom transformations for extractedattributes.
- Default Values: Define default values for missing data fields.

### Schema Support

| Schema Library                                       | Status              | Notes                                                              |
| ---------------------------------------------------- | ------------------- | ------------------------------------------------------------------ |
| [Zod](https://github.com/colinhacks/zod)             | ✅ Supported        | Default schema tool for `xscrape`                                  |
| [Effect/Schema](https://github.com/Effect-TS/schema) | 🚧 Planned          | Planned support for Effect/Schema for additional flexibility       |
| [Joi](https://github.com/sideway/joi)                | 🚧 Planned          | Support for Joi for those familiar with server-side validation     |
| [Yup](https://github.com/jquense/yup)                | 🚧 Planned          | Adding Yup support for schema validation in front-end applications |
| Others...                                            | 🔄 In Consideration | Potential support for other schema tools as per user feedback      |

## Installation

To install this library, use npm or yarn:

```bash
pnpm add xscrape
# or
npm install xscrape
```

## Usage

Below is an example of how to use xscrape for extracting and transforming data
from an HTML document:

1. Define Your Schema

```ts
import { z } from 'zod';

const schema = z.object({
  title: z.string().default('No title'),
  description: z.string(),
  keywords: z.array(z.string()),
  views: z.number(),
});
```

2. Define Field Definitions

```ts
import { type SchemaFieldDefinitions } from 'xscrape';

type FieldDefinitions = SchemaFieldDefinitions<z.infer<typeof schema>>;

const fields: FieldDefinitions = {
  title: { selector: 'title' },
  description: {
    selector: 'meta[name="description"]',
    attribute: 'content',

    defaultValue: 'No description',
  },
  keywords: {
    selector: 'meta[name="keywords"]',
    attribute: 'content',
    transform: (value) => value.split(','),
    defaultValue: [],
  },
  views: {
    selector: 'meta[name="views"]',
    attribute: 'content',
    transform: (value) => parseInt(value, 10),
    defaultValue: 0,
  },
};
```

3. Create a Scraper and Extract Data

```ts
import { createScraper } from 'xscrape';
import { ZodValidator } from 'xscrape/validators/zod';

const validator = new ZodValidator(schema);
const scraper = createScraper({ fields, validator });

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

const data = scraper(html);
console.log(data);

// Outputs:
// {
// title: 'Example Title',
// description: 'An example description.',
// keywords: ['typescript', 'html', 'parsing'],
// views: 1234
// }
```

## Configuration

xscrape offers a range of configuration options through the types provided,
allowing for detailed customization and robust data extraction and validation:

- `SchemaFieldDefinitions`: Determines how fields are extracted from the HTML.
- `SchemaValidator`: Validates the extracted data according to defined schemas.

## API Reference

- `createScraper(config: ScrapeConfig): (html: string) => T` Creates a scraping function based on the specified fields and validator.
- `ZodValidator` A built-in validator using Zod, allowing you to define schemas andvalidate data effortlessly.

For a complete list of API methods and more advanced configuration options,refer to the documentation on the project homepage https://github.com/johnie/xscrape.

## Contributing

Contributions are welcome! Please see the Contributing Guide https://github.com/johnie/xscrape/blob/main/CONTRIBUTING.md for more information.

## License

This project is licensed under the MIT License. See the LICENSE
https://github.com/johnie/xscrape/blob/main/LICENSE file for details.
