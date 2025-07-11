import { describe, test, expect } from 'vitest';
import { defineScraper } from '@/defineScraper';
import * as v from 'valibot';
import { kitchenSink, kitchenSinkWithNested } from './__fixtures__/html';

describe('xscrape with Valibot', () => {
  test('extracts data from HTML', async () => {
    const scraper = defineScraper({
      schema: v.object({
        title: v.string(),
        description: v.string(),
        keywords: v.array(v.string()),
        views: v.pipe(
          v.string(),
          v.transform((val) => Number(val)),
        ),
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
      schema: v.object({
        title: v.optional(v.string(), 'No title'),
        description: v.optional(v.string(), 'No description'),
        keywords: v.optional(v.array(v.string()), []),
        views: v.pipe(
          v.optional(v.string(), '0'),
          v.transform((val) => Number(val)),
        ),
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

    const { data, error } = await scraper(
      '<html><head></head><body></body></html>',
    );

    expect(error).toBeUndefined();
    expect(data).toEqual({
      title: 'No title',
      keywords: [],
      description: 'No description',
      views: 0,
    });
  });

  test('handles multiple values', async () => {
    const scraper = defineScraper({
      schema: v.object({
        keywords: v.array(v.string()),
      }),
      extract: {
        keywords: {
          selector: 'meta[name="keywords"]',
          value(el) {
            return el.attribs['content']?.split(',');
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
      schema: v.object({
        title: v.string(),
        description: v.string(),
        keywords: v.array(v.string()),
        views: v.pipe(
          v.optional(v.string(), '0'),
          v.transform((val) => Number(val)),
        ),
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

    const { error } = await scraper(
      '<html><head><meta name="keywords" content="invalid"></head><body></body></html>',
    );

    expect(error).toBeDefined();
  });

  test('extracts nested data from HTML', async () => {
    const scraper = defineScraper({
      schema: v.object({
        title: v.string(),
        image: v.optional(
          v.object({
            url: v.pipe(v.string(), v.url()),
            width: v.pipe(
              v.string(),
              v.transform((v) => Number(v)),
            ),
            height: v.pipe(
              v.string(),
              v.transform((v) => Number(v)),
            ),
          }),
        ),
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
