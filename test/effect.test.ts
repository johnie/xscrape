import { describe, test, expect } from 'vitest';
import { defineScraper } from '@/defineScraper.js';
import { kitchenSink, kitchenSinkWithNested } from './__fixtures__/html.js';

describe('xscrape with Effect/Schema', () => {
  test('extracts data from HTML', async () => {
    const scraper = defineScraper({
      validator: 'effect',
      schema: (S) =>
        S.Struct({
          title: S.String,
          description: S.String,
          keywords: S.split(','),
          views: S.Number,
        }),
      extract: {
        title: 'title',
        description: {
          selector: 'meta[name="description"]',
          value: 'content',
        },
        keywords: {
          selector: 'meta[name="keywords"]',
          value: 'content',
        },
        views: {
          selector: 'meta[name="views"]',
          value: (el) => parseInt(el.attribs['content'] || '0', 10),
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

  // test('handles missing data', () => {
  //   const validator = new EffectValidator(schema);
  //   const scraper = createScraper({
  //     fields,
  //     validator,
  //   });
  //   const data = scraper('<html><head></head><body></body></html>');

  //   expect(data).toEqual({
  //     title: 'No title',
  //     description: 'No description',
  //     keywords: [],
  //     views: 0,
  //   });
  // });

  // test('handles multiple values', () => {
  //   const validator = new EffectValidator(schema);
  //   const scraper = createScraper({
  //     fields,
  //     validator,
  //   });
  //   const data = scraper(
  //     '<html><head><meta name="keywords" content="typescript,html,parsing"></head><body></body></html>',
  //   );

  //   expect(data).toEqual({
  //     title: 'No title',
  //     description: 'No description',
  //     keywords: ['typescript', 'html', 'parsing'],
  //     views: 0,
  //   });
  // });

  // test('handles invalid data', () => {
  //   const validator = new EffectValidator(schema);
  //   const scraper = createScraper({
  //     fields,
  //     validator,
  //   });
  //   try {
  //     scraper(
  //       '<html><head><meta name="keywords" content="invalid"></head><body></body></html>',
  //     );
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(Error);
  //   }
  // });

  // test('extracts nested data from HTML', () => {
  //   const validator = new EffectValidator(schemaWithNested);
  //   const scraper = createScraper({
  //     fields: nestedFields,
  //     validator,
  //   });
  //   const data = scraper(htmlWithNested);

  //   expect(data).toEqual({
  //     title: 'Example Title',
  //     image: {
  //       url: 'https://example.se/images/c12ffe73-3227-4a4a-b8ad-a3003cdf1d70?h=708&tight=false&w=1372',
  //       width: 1372,
  //       height: 708,
  //     },
  //   });
  // });
});
