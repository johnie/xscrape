import * as cheerio from 'cheerio';
import { createValidator } from '@/validators.js';
import type {
  ScraperConfig,
  ScraperResult,
  ValidatorType,
} from '@/types/main.js';

/**
 * Defines a scraper with the provided configuration.
 *
 * @template T - The shape of the extracted data.
 * @template V - The type of the validator used for validation.
 * @template R - The type of the result after optional transformation, defaults to T.
 *
 * @param config - The configuration object for the scraper.
 * @returns A function that takes an HTML string and returns the scraping result, which could be
 * a scraper result or a promise of a scraper result.
 */
export function defineScraper<
  T extends Record<string, unknown>,
  V extends ValidatorType,
  R extends T = T,
>(config: ScraperConfig<T, V, R>): (html: string) => Promise<ScraperResult<R>> {
  const validator = createValidator(config.validator, config.schema);

  return async (html: string): Promise<ScraperResult<R>> => {
    try {
      const $ = cheerio.load(html);
      const extractedData = $.extract(config.extract);

      const validationResult = validator.validate(extractedData);

      if (!validationResult.success) {
        return { error: validationResult.error };
      }

      if (!validationResult.data) {
        return {
          error: new Error('Validation succeeded but no data was returned'),
        };
      }

      // Apply optional transformation
      if (config.transform) {
        try {
          const transformed = await Promise.resolve(
            config.transform(validationResult.data),
          );
          return { data: transformed };
        } catch (error) {
          return { error };
        }
      }

      return { data: validationResult.data as R };
    } catch (error) {
      return { error };
    }
  };
}
