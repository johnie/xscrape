# xscrape

`xscrape` is a powerful and flexible library designed for extracting and transforming data from HTML documents using user-defined schemas. It now supports any validation library that implements the **Standard Schema**, allowing you to bring your own schema for robust, type-safe data validation.

## Features

  * **HTML Parsing**: Extract data from HTML using CSS selectors with the help of [cheerio](https://github.com/cheeriojs/cheerio).
  * **Flexible Schema Validation**: Validate and transform extracted data with any validation library that implements the [Standard Schema](https://standardschema.dev), such as Zod, Valibot, ArkType, and Effect Schema.
  * **Custom Transformations**: Provide custom transformations for extracted attributes.
  * **Default Values**: Define default values for missing data fields through your chosen schema library's features.
  * **Nested Field Support**: Define and extract nested data structures from HTML elements.

-----

## Installation

To install this library, use your preferred package manager:

```bash
pnpm add xscrape
# or
npm install xscrape
```

You will also need to install your chosen schema validation library, for example, Zod:

```bash
pnpm add zod
# or
npm install zod
```

-----

## Usage

Below is an example of how to use `xscrape` with a Zod schema to extract and transform data from an HTML document.

```ts
import { defineScraper } from 'xscrape';
import { z } from 'zod';

const scraper = defineScraper({
  schema: z.object({
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

You can handle missing data by using the features of your chosen schema library, such as default values in Zod.

```ts
import { defineScraper } from 'xscrape';
import { z } from 'zod';

const scraper = defineScraper({
  schema: z.object({
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

`xscrape` also supports extracting nested data structures.

```ts
import { defineScraper } from 'xscrape';
import { z } from 'zod';

const scraper = defineScraper({
  schema: z.object({
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

-----

## Configuration

The `defineScraper` function accepts a configuration object with the following properties:

  * **`schema`**: A schema object from any library that implements the [Standard Schema](https://standardschema.dev) interface. This schema defines the shape and validation rules for the extracted data.
  * **`extract`**: An object that determines how fields are extracted from the HTML using CSS selectors.
  * **`transform`** (optional): A function to apply custom transformations to the validated data.

-----

## Contributing

Contributions are welcome\! Please see the [Contributing Guide](https://github.com/johnie/xscrape/blob/main/CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/johnie/xscrape/blob/main/LICENSE) file for details.
