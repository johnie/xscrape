// tests/scraper.effect.test.ts
import { describe, test, expect } from 'vitest';
import { defineScraper } from '@/defineScraper';
import { kitchenSink, kitchenSinkWithNested } from './__fixtures__/html';
import { Schema } from 'effect';

describe('xscrape with Effect Schema', () => {
  const effectSchema = Schema.Struct({
    title: Schema.optionalWith(Schema.String, {
      default: () => 'No title',
    }),
    description: Schema.optionalWith(Schema.String, {
      default: () => 'No description',
    }),
    keywords: Schema.optionalWith(Schema.Array(Schema.String), {
      exact: true,
    }),
    views: Schema.optionalWith(Schema.NumberFromString, {
      default: () => 0,
    }),
  });

  const schema = Schema.standardSchemaV1(effectSchema);

  test('extracts data from HTML', async () => {
    const scraper = defineScraper({
      schema,
      extract: {
        title: { selector: 'title' },
        description: { selector: 'meta[name="description"]', value: 'content' },
        keywords: {
          selector: 'meta[name="keywords"]',
          value(el) {
            if (!el.attribs.content) {
              return [];
            }
            return el.attribs.content
              .split(',')
              .map((keyword) => keyword.trim());
          },
        },
        views: { selector: 'meta[name="views"]', value: 'content' },
      },
    });
    const { data, error } = await scraper(kitchenSink);

    expect(error).toBeUndefined();
    expect(data).toEqual({
      title: 'Example Title',
      description: 'An example description.',
      keywords: ['typescript', 'html', 'parsing'],
      views: 1234,
    });
  });

  test('handles missing data', async () => {
    const scraper = defineScraper({
      schema,
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
    const { data, error } = await scraper(
      '<html><head></head><body></body></html>',
    );

    expect(error).toBeUndefined();

    expect(data).toEqual({
      title: 'No title',
      description: 'No description',
      views: 0,
    });
  });

  test('handles multiple values', async () => {
    const multipleValuesSchema = Schema.Struct({
      keywords: Schema.Array(Schema.String),
    });

    const schema = Schema.standardSchemaV1(multipleValuesSchema);
    const scraper = defineScraper({
      schema,
      extract: {
        keywords: {
          selector: 'meta[name="keywords"]',
          value(el) {
            return el.attribs['content']
              ?.split(',')
              .map((keyword) => keyword.trim());
          },
        },
      },
    });
    const { data, error } = await scraper(
      '<html><head><meta name="keywords" content="typescript,html,parsing"></head><body></body></html>',
    );

    expect(error).toBeUndefined();

    expect(data).toEqual({
      keywords: ['typescript', 'html', 'parsing'],
    });
  });

  test('handles invalid data', async () => {
    const scraper = defineScraper({
      schema,
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
    try {
      await scraper(
        '<html><head><meta name="keywords" content="invalid"></head><body></body></html>',
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('extracts nested data from HTML', async () => {
    const schemaWithNested = Schema.Struct({
      title: Schema.String,
      image: Schema.Struct({
        url: Schema.String,
        width: Schema.NumberFromString,
        height: Schema.NumberFromString,
      }),
    });

    const schema = Schema.standardSchemaV1(schemaWithNested);
    const scraper = defineScraper({
      schema,
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
    const { data } = await scraper(kitchenSinkWithNested);

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
