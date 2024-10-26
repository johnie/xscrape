import { describe, test, expect } from 'vitest';
import * as S from 'effect/Schema';
import { createScraper } from '@/createScraper.js';
import { EffectValidator } from '@/validators/effect.js';
import { type SchemaFieldDefinitions } from '@/types.js';

const Title = S.optional(S.String).pipe(
  S.withDecodingDefault(() => 'No title'),
);

const schema = S.Struct({
  title: Title,
  description: S.String,
  keywords: S.Array(S.String),
  views: S.Number,
});

const schemaWithNested = S.Struct({
  title: Title,
  image: S.Struct({
    url: S.String,
    width: S.Number,
    height: S.Number,
  }),
});

type FieldDefinitions = SchemaFieldDefinitions<S.Schema.Type<typeof schema>>;
type NestedFieldDefinitions = SchemaFieldDefinitions<
  S.Schema.Type<typeof schemaWithNested>
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

describe('xscrape with Effect/Schema', () => {
  test('extracts data from HTML', () => {
    const validator = new EffectValidator(schema);
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
    const validator = new EffectValidator(schema);
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
    const validator = new EffectValidator(schema);
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
    const validator = new EffectValidator(schema);
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
    const validator = new EffectValidator(schemaWithNested);
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
