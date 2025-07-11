import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ExtractMap, ExtractedMap } from './cheerio.js';

export type ScraperConfig<
  S extends StandardSchemaV1<any, any>,
  R extends StandardSchemaV1.InferOutput<S> = StandardSchemaV1.InferOutput<S>,
> = {
  schema: S;
  extract: ExtractMap;
  transform?: (data: StandardSchemaV1.InferOutput<S>) => Promise<R> | R;
};

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: unknown;
};

export type ScraperResult<T> = {
  data?: T;
  error?: unknown;
};
