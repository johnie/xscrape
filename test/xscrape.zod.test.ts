import { describe, expect, test } from 'vitest';
import z from 'zod';
import { defineScraper } from '@/index';
import {
  kitchenSink,
  kitchenSinkWithLinks,
  kitchenSinkWithNested,
  largeKitchenSink,
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
            return el.attribs.content?.split(',');
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
            return el.attribs.content?.split(',');
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
            return el.attribs.content?.split(',');
          },
        },
        views: {
          selector: 'meta[name="views"]',
          value: 'content',
        },
      },
    });
    const { data, error } = await scraper(
      '<html><head><meta name="keywords" content="invalid"></head><body></body></html>',
    );

    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(Array.isArray(error)).toBe(true);
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

  test('applies sync transform', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string(),
      }),
      extract: {
        title: { selector: 'title' },
      },
      transform: (data) => ({
        ...data,
        title: data.title.toUpperCase(),
      }),
    });
    const { data, error } = await scraper(kitchenSink);

    expect(error).toBeUndefined();
    expect(data).toEqual({ title: 'EXAMPLE TITLE' });
  });

  test('applies async transform', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string(),
      }),
      extract: {
        title: { selector: 'title' },
      },
      transform: async (data) => ({
        ...data,
        title: data.title.toLowerCase(),
      }),
    });
    const { data, error } = await scraper(kitchenSink);

    expect(error).toBeUndefined();
    expect(data).toEqual({ title: 'example title' });
  });

  test('returns error when transform throws', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string(),
      }),
      extract: {
        title: { selector: 'title' },
      },
      transform: () => {
        throw new Error('transform failed');
      },
    });
    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('transform failed');
  });

  test('scraper is reusable across multiple calls', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string(),
      }),
      extract: {
        title: { selector: 'title' },
      },
    });

    const first = await scraper(kitchenSink);
    const second = await scraper(
      '<html><head><title>Other</title></head><body></body></html>',
    );

    expect(first.data).toEqual({ title: 'Example Title' });
    expect(second.data).toEqual({ title: 'Other' });
  });

  test('handles empty HTML string', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string().default('fallback'),
      }),
      extract: {
        title: { selector: 'title' },
      },
    });
    const { data, error } = await scraper('');

    expect(error).toBeUndefined();
    expect(data).toEqual({ title: 'fallback' });
  });

  test('extracts from large complex HTML', async () => {
    const scraper = defineScraper({
      schema: z.object({
        title: z.string(),
        description: z.string(),
        ogTitle: z.string(),
        ogImage: z.string(),
        twitterCard: z.string(),
        headings: z.array(z.string()),
        tableRows: z.array(z.string()),
      }),
      extract: {
        title: { selector: 'title' },
        description: {
          selector: 'meta[name="description"]',
          value: 'content',
        },
        ogTitle: {
          selector: 'meta[property="og:title"]',
          value: 'content',
        },
        ogImage: {
          selector: 'meta[property="og:image"]',
          value: 'content',
        },
        twitterCard: {
          selector: 'meta[name="twitter:card"]',
          value: 'content',
        },
        headings: [{ selector: 'h2' }],
        tableRows: [{ selector: 'tbody td:first-child' }],
      },
    });
    const { data, error } = await scraper(largeKitchenSink);

    expect(error).toBeUndefined();
    expect(data?.title).toBe('HTML Kitchen Sink');
    expect(data?.ogTitle).toBe('HTML Kitchen Sink Example');
    expect(data?.ogImage).toBe('https://example.com/images/kitchen-sink.jpg');
    expect(data?.twitterCard).toBe('summary_large_image');
    expect(data?.headings).toContain('Headings');
    expect(data?.headings).toContain('Tables');
    expect(data?.tableRows).toContain('John Doe');
    expect(data?.tableRows).toContain('Jane Doe');
  });
});
