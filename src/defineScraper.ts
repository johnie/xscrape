import type { StandardSchemaV1 } from '@standard-schema/spec';
import * as cheerio from 'cheerio';
import type { ScraperConfig, ScraperResult } from '@/types/main';

export function defineScraper<
  S extends StandardSchemaV1,
  R extends StandardSchemaV1.InferOutput<S> = StandardSchemaV1.InferOutput<S>,
>(config: ScraperConfig<S, R>): (html: string) => Promise<ScraperResult<R>> {
  return async (html: string): Promise<ScraperResult<R>> => {
    try {
      const $ = cheerio.load(html);
      const extractedData = $.extract(config.extract);

      const validationResult = await Promise.resolve(
        config.schema['~standard'].validate(extractedData),
      );

      if (validationResult.issues) {
        return { error: validationResult.issues };
      }

      if (!('value' in validationResult)) {
        return {
          error: new Error(
            'xscrape: Validation succeeded but no data was returned',
          ),
        };
      }

      if (config.transform) {
        try {
          const transformed = await Promise.resolve(
            config.transform(validationResult.value),
          );
          return { data: transformed };
        } catch (error) {
          return { error };
        }
      }

      return { data: validationResult.value as R };
    } catch (error) {
      return { error };
    }
  };
}
