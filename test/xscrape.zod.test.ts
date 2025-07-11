import { describe, expect, test } from 'vitest';
import z from 'zod';
import { defineScraper } from '@/defineScraper';
import {
  kitchenSink,
  kitchenSinkWithLinks,
  kitchenSinkWithNested,
} from './__fixtures__/html';

describe('xscrape with Zod', () => {
  test('extracts data from HTML', async () => {
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
    const scraper = defineScraper({
      schema: z.object({
        keywords: z.array(z.string()),
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
    try {
      await scraper(
        '<html><head><meta name="keywords" content="invalid"></head><body></body></html>',
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('extracts nested data from HTML', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string(),
        image: z
          .object({
            url: z.string().url(),
            width: z.coerce.number(),
            height: z.coerce.number(),
          })
          .default({ url: '', width: 0, height: 0 })
          .optional(),
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

  test('extracts links from HTML', async () => {
    const scraper = defineScraper({
      schema: z.object({
        links: z.array(z.string()),
      }),
      extract: {
        links: [
          {
            selector: 'a',
            value: 'href',
          },
        ],
      },
    });
    const { data, error } = await scraper(kitchenSinkWithLinks);

    expect(error).toBeUndefined();

    expect(data).toEqual({
      links: [
        'https://example.com',
        '#internal-link',
        'mailto:example@example.com',
      ],
    });
  });
});
