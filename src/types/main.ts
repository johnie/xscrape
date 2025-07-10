import type { ExtractMap } from '@/types/cheerio';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export type ScraperConfig<
  T extends Record<string, unknown>,
  S extends StandardSchemaV1<unknown, T>,
> = {
  schema: S;
  extract: ExtractMap;
  transform?: (
    data: StandardSchemaV1.InferOutput<S>,
  ) =>
    | Promise<StandardSchemaV1.InferOutput<S>>
    | StandardSchemaV1.InferOutput<S>;
};

export type ScraperResult<T> = {
  data?: T;
  error?: unknown;
};
