import type { StandardSchemaV1 } from '@standard-schema/spec';
import { createScraperRuntime } from '@/internal/runtime';
import type { ScraperConfig, ScraperResult } from '@/types/main';

export type {
  ExtractConfig,
  ExtractDescriptor,
  ExtractField,
  ExtractNode,
  ExtractValueCallback,
} from '@/types/extract';
export type { ScraperConfig, ScraperResult } from '@/types/main';

export function defineScraper<
  S extends StandardSchemaV1,
  R extends StandardSchemaV1.InferOutput<S> = StandardSchemaV1.InferOutput<S>,
>(config: ScraperConfig<S, R>): (html: string) => Promise<ScraperResult<R>> {
  return createScraperRuntime(config);
}
