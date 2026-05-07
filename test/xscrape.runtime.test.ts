import type { StandardSchemaV1 } from '@standard-schema/spec';
import { describe, expect, test } from 'vitest';
import { defineScraper } from '@/index';
import {
  kitchenSink,
  kitchenSinkWithLinks,
  largeKitchenSink,
} from './__fixtures__/html';

const WORD_BOUNDARY_REGEX = /\s+/;

function passthroughSchema<T extends object>(): StandardSchemaV1<T, T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      types: {} as StandardSchemaV1.Types<T, T>,
      validate(value) {
        return { value: value as T };
      },
    },
  };
}

function failingSchema(
  issues: readonly StandardSchemaV1.Issue[] = [{ message: 'invalid' }],
): StandardSchemaV1<unknown, never> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      types: {} as StandardSchemaV1.Types<unknown, never>,
      validate() {
        return { issues };
      },
    },
  };
}

function missingValueSchema<T extends object>(): StandardSchemaV1<T, T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      types: {} as StandardSchemaV1.Types<T, T>,
      validate() {
        return {} as StandardSchemaV1.Result<T>;
      },
    },
  };
}

describe('xscrape runtime boundary', () => {
  test('extracts owned node helpers, nested objects, and arrays', async () => {
    const scraper = defineScraper({
      schema: passthroughSchema<{
        title?: string;
        description?: string;
        keywords?: string[];
        headings?: string[];
        image?: {
          url?: string;
          width?: string;
        };
        readingTime?: number;
        markup?: string;
      }>(),
      extract: {
        title: { selector: 'title' },
        description: {
          selector: 'meta[name="description"]',
          value: 'content',
        },
        keywords: {
          selector: 'meta[name="keywords"]',
          value(node) {
            return (
              node
                .attr('content')
                ?.split(',')
                .map((keyword) => keyword.trim()) ?? []
            );
          },
        },
        headings: [{ selector: 'h2' }],
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
          },
        },
        readingTime: {
          selector: 'body',
          value(node) {
            return node.text().split(WORD_BOUNDARY_REGEX).filter(Boolean)
              .length;
          },
        },
        markup: {
          selector: 'head',
          value(node) {
            return node.html();
          },
        },
      },
    });

    const { data, error } = await scraper(largeKitchenSink);

    expect(error).toBeUndefined();
    expect(data?.title).toBe('HTML Kitchen Sink');
    expect(data?.description).toBe(
      'A comprehensive HTML kitchen sink example demonstrating a variety of HTML elements for testing and styling.',
    );
    expect(data?.keywords).toEqual([
      'HTML',
      'kitchen sink',
      'example',
      'meta tags',
      'og tags',
      'JSON-LD',
    ]);
    expect(data?.headings).toContain('Headings');
    expect(data?.headings).toContain('Text Elements');
    expect(data?.headings).toContain('Blockquotes');
    expect(data?.image).toEqual({
      url: 'https://example.com/images/kitchen-sink.jpg',
      width: undefined,
    });
    expect(data?.readingTime).toBeGreaterThan(20);
    expect(data?.markup).toContain('<meta name="description"');
  });

  test('extracts arrays with attribute shorthands', async () => {
    const scraper = defineScraper({
      schema: passthroughSchema<{
        links?: string[];
      }>(),
      extract: {
        links: [{ selector: 'a', value: 'href' }],
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

  test('applies async transforms after validation', async () => {
    const scraper = defineScraper({
      schema: passthroughSchema<{
        title?: string;
      }>(),
      extract: {
        title: { selector: 'title' },
      },
      transform: async (data) => ({
        title: data.title?.toUpperCase(),
      }),
    });

    const { data, error } = await scraper(kitchenSink);

    expect(error).toBeUndefined();
    expect(data).toEqual({ title: 'EXAMPLE TITLE' });
  });

  test('returns validation issues without leaking runtime internals', async () => {
    const issues = [{ message: 'title is required', path: ['title'] }] as const;
    const scraper = defineScraper({
      schema: failingSchema(issues),
      extract: {
        title: { selector: 'title' },
      },
    });

    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toEqual(issues);
  });

  test('returns transform errors as scraper errors', async () => {
    const scraper = defineScraper({
      schema: passthroughSchema<{
        title?: string;
      }>(),
      extract: {
        title: { selector: 'title' },
      },
      transform() {
        throw new Error('transform failed');
      },
    });

    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('transform failed');
  });

  test('guards against validators that succeed without a value', async () => {
    const scraper = defineScraper({
      schema: missingValueSchema<{
        title?: string;
      }>(),
      extract: {
        title: { selector: 'title' },
      },
    });

    const { data, error } = await scraper(kitchenSink);

    expect(data).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'xscrape: Validation succeeded but no data was returned',
    );
  });

  test('reuses the same scraper across multiple calls', async () => {
    const scraper = defineScraper({
      schema: passthroughSchema<{
        title?: string;
      }>(),
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
});
