import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ExtractConfig } from '@/types/extract';

export interface ScraperConfig<
  S extends StandardSchemaV1,
  R extends StandardSchemaV1.InferOutput<S> = StandardSchemaV1.InferOutput<S>,
> {
  extract: ExtractConfig<StandardSchemaV1.InferOutput<S>>;
  schema: S;
  transform?: (data: StandardSchemaV1.InferOutput<S>) => Promise<R> | R;
}

export type ScraperResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: unknown };
