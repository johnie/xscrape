import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ExtractMap } from '@/types/cheerio';

type SchemaAwareExtractMap<T> = {
  [K in keyof T]: ExtractMap[string];
};

export type ScraperConfig<
  S extends StandardSchemaV1,
  R extends StandardSchemaV1.InferOutput<S> = StandardSchemaV1.InferOutput<S>,
> = {
  schema: S;
  extract: SchemaAwareExtractMap<StandardSchemaV1.InferOutput<S>>;
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
