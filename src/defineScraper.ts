import * as cheerio from 'cheerio';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ScraperConfig, ScraperResult } from '@/types/main';

export function defineScraper<
  T extends Record<string, unknown>,
  S extends StandardSchemaV1<any, T>,
>(
  config: ScraperConfig<T, S>,
): (html: string) => Promise<ScraperResult<StandardSchemaV1.InferOutput<S>>> {
  return async (
    html: string,
  ): Promise<ScraperResult<StandardSchemaV1.InferOutput<S>>> => {
    try {
      const $ = cheerio.load(html);
      const extractedData = $.extract(config.extract);

      const validationResult = await Promise.resolve(
        config.schema['~standard'].validate(extractedData),
      );

      if (validationResult.issues) {
        return { error: validationResult.issues };
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

      return { data: validationResult.value };
    } catch (error) {
      return { error };
    }
  };
}
