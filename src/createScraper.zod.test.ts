import { createScraper } from '@/createScraper.js';
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidator } from '@/validators/zod.js';
import { type SchemaFieldDefinitions } from '@/types.js';

const schema = z.object({
  title: z.string().default('No title'),
  description: z.string(),
  keywords: z.array(z.string()),
  views: z.number(),
});

const schemaWithNested = z.object({
  title: z.string().default('No title nested'),
  image: z
    .object({
      url: z.string(),
      width: z.number(),
      height: z.number(),
    })
    .default({ url: '', width: 0, height: 0 })
    .optional(),
});

type FieldDefinitions = SchemaFieldDefinitions<z.infer<typeof schema>>;
type NestedFieldDefinitions = SchemaFieldDefinitions<
  z.infer<typeof schemaWithNested>
>;

const fields: FieldDefinitions = {
  title: {
    selector: 'title',
  },
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

const nestedFields: NestedFieldDefinitions = {
  title: {
    selector: 'title',
  },
  image: {
    fields: {
      url: {
        selector: 'meta[property="og:image"]',
        attribute: 'content',
      },
      width: {
        selector: 'meta[property="og:image:width"]',
        attribute: 'content',
        transform: (value) => parseInt(value, 10),
      },
      height: {
        selector: 'meta[property="og:image:height"]',
        attribute: 'content',
        transform: (value) => parseInt(value, 10),
      },
    },
  },
};

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

const htmlWithNested = `
<!DOCTYPE html>
<html>
<head>
  <title>Example Title</title>
  <meta property="og:image" content="https://example.se/images/c12ffe73-3227-4a4a-b8ad-a3003cdf1d70?h=708&amp;tight=false&amp;w=1372">
  <meta property="og:image:width" content="1372">
  <meta property="og:image:height" content="708">
</head>
<body></body>
</html>
`;

describe('xscrape with Zod', () => {
  test('extracts data from HTML', () => {
    const validator = new ZodValidator(schema);
    const scraper = createScraper({
      fields,
      validator,
    });
    const data = scraper(html);

    expect(data).toEqual({
      title: 'Example Title',
      description: 'An example description.',
      keywords: ['typescript', 'html', 'parsing'],
      views: 1234,
    });
  });

  test('handles missing data', () => {
    const validator = new ZodValidator(schema);
    const scraper = createScraper({
      fields,
      validator,
    });
    const data = scraper('<html><head></head><body></body></html>');

    expect(data).toEqual({
      title: 'No title',
      description: 'No description',
      keywords: [],
      views: 0,
    });
  });

  test('handles multiple values', () => {
    const validator = new ZodValidator(schema);
    const scraper = createScraper({
      fields,
      validator,
    });
    const data = scraper(
      '<html><head><meta name="keywords" content="typescript,html,parsing"></head><body></body></html>',
    );

    expect(data).toEqual({
      title: 'No title',
      description: 'No description',
      keywords: ['typescript', 'html', 'parsing'],
      views: 0,
    });
  });

  test('handles invalid data', () => {
    const validator = new ZodValidator(schema);
    const scraper = createScraper({
      fields,
      validator,
    });
    try {
      scraper(
        '<html><head><meta name="keywords" content="invalid"></head><body></body></html>',
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('extracts nested data from HTML', () => {
    const validator = new ZodValidator(schemaWithNested);
    const scraper = createScraper({
      fields: nestedFields,
      validator,
    });
    const data = scraper(htmlWithNested);

    expect(data).toEqual({
      title: 'Example Title',
      image: {
        url: 'https://example.se/images/c12ffe73-3227-4a4a-b8ad-a3003cdf1d70?h=708&tight=false&w=1372',
        width: 1372,
        height: 708,
      },
    });
  });
});
