import { expectTypeOf, test } from 'vitest';
import type { ExtractConfig } from '@/index';

test('extract configs allow owned scalar, nested, array, and callback forms', () => {
  const extract = {
    title: { selector: 'title' },
    keywords: {
      selector: 'meta[name="keywords"]',
      value(node) {
        return node.attr('content')?.split(',') ?? [];
      },
    },
    image: {
      selector: 'head',
      value: {
        url: {
          selector: 'meta[property="og:image"]',
          value: 'content',
        },
      },
    },
    links: [{ selector: 'a', value: 'href' }],
  } satisfies ExtractConfig<{
    title: string;
    keywords: string[];
    image: {
      url: string;
    };
    links: string[];
  }>;

  expectTypeOf(extract.keywords).toBeObject();
  expectTypeOf(extract.links).toBeArray();
});

test('extract callbacks expose xscrape node helpers instead of raw dom internals', () => {
  const extract = {
    title: {
      selector: 'title',
      value(node) {
        expectTypeOf(node.attr('content')).toEqualTypeOf<string | undefined>();
        expectTypeOf(node.text()).toEqualTypeOf<string>();
        expectTypeOf(node.html()).toEqualTypeOf<string | undefined>();

        // @ts-expect-error xscrape no longer exposes raw domhandler attributes
        return node.attribs.content;
      },
    },
  } satisfies ExtractConfig<{
    title: string;
  }>;

  expectTypeOf(extract.title).toBeObject();
});
