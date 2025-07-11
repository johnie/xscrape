import { describe, test, expect } from 'vitest';
import { defineScraper } from '@/defineScraper';
import { kitchenSink, kitchenSinkWithNested } from './__fixtures__/html';
import { ArkError, type } from 'arktype';

describe('xscrape with Arktype', () => {
  test('extracts data from HTML', async () => {
    const schema = type({
      title: 'string',
      description: 'string',
      keywords: 'string[]',
      views: 'number',
    });
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
            return el.attribs['content']?.split(',') || [];
          },
        },
        views: {
          selector: 'meta[name="views"]',
          value(el) {
            const raw = el.attribs['content'];
            return raw == null ? undefined : parseInt(raw, 10);
          },
        },
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
    const schema = type({
      title: type('string | undefined')
        .pipe.try((t) => t ?? 'No title')
        .optional(),
      description: type('string | undefined')
        .pipe.try((d) => d ?? 'No description')
        .optional(),
      views: type('number | undefined')
        .pipe.try((n) => n ?? 0)
        .optional(),
    });

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
          value(el) {
            return el.attribs['content']
              ? parseInt(el.attribs['content'], 10)
              : 0;
          },
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
    const schema = type({
      keywords: 'string[]',
    });
    const scraper = defineScraper({
      schema,
      extract: {
        keywords: {
          selector: 'meta[name="keywords"]',
          value(el) {
            return el.attribs['content']?.split(',') || [];
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
    const schema = type({
      title: 'string',
      description: 'string',
      keywords: 'string[]',
      views: 'string.integer',
    });
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
      expect(error).toBeInstanceOf(ArkError);
    }
  });

  test('extracts nested data from HTML', async () => {
    const schema = type({
      title: 'string',
      image: {
        url: 'string.url',
        width: type('string').pipe((s) => {
          const n = Number(s);
          if (Number.isNaN(n)) throw new Error(`width must be numeric`);
          return n;
        }),
        height: type('string').pipe((s) => {
          const n = Number(s);
          if (Number.isNaN(n)) throw new Error(`height must be numeric`);
          return n;
        }),
      },
    });
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
    const { data, error } = await scraper(kitchenSinkWithNested);

    expect(error).toBeUndefined();

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
