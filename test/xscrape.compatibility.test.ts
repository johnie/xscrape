import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type } from 'arktype';
import { Schema } from 'effect';
import { object as vObject, string as vString } from 'valibot';
import { describe, expect, test } from 'vitest';
import z from 'zod';
import { defineScraper } from '@/index';
import { kitchenSink } from './__fixtures__/html';

const compatibilityCases = [
  {
    name: 'Zod',
    schema: z.object({
      title: z.string(),
    }),
  },
  {
    name: 'Valibot',
    schema: vObject({
      title: vString(),
    }),
  },
  {
    name: 'Arktype',
    schema: type({
      title: 'string',
    }),
  },
  {
    name: 'Effect Schema',
    schema: Schema.standardSchemaV1(
      Schema.Struct({
        title: Schema.String,
      }),
    ),
  },
] satisfies Array<{
  name: string;
  schema: StandardSchemaV1;
}>;

describe('xscrape standard-schema compatibility', () => {
  for (const testCase of compatibilityCases) {
    test(`extracts required data with ${testCase.name}`, async () => {
      const scraper = defineScraper({
        schema: testCase.schema,
        extract: {
          title: { selector: 'title' },
        },
      });

      const { data, error } = await scraper(kitchenSink);

      expect(error).toBeUndefined();
      expect(data).toEqual({ title: 'Example Title' });
    });

    test(`surfaces validation errors with ${testCase.name}`, async () => {
      const scraper = defineScraper({
        schema: testCase.schema,
        extract: {
          title: { selector: 'title' },
        },
      });

      const { data, error } = await scraper(
        '<html><head></head><body></body></html>',
      );

      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    });
  }
});
