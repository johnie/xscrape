import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { ParsedHtml } from "@/internal/document";
import type { ScraperError } from "@/types/error";
import type { ExtractConfig } from "@/types/extract";

export interface ScraperConfig<
  S extends StandardSchemaV1,
  R = StandardSchemaV1.InferOutput<S>,
> {
  readonly extract: ExtractConfig<StandardSchemaV1.InferInput<S>>;
  readonly schema: S;
  readonly transform?: (
    data: StandardSchemaV1.InferOutput<S>
  ) => Promise<R> | R;
}

export type ScraperResult<T> =
  | { ok: true; data: T; error?: never }
  | { ok: false; error: ScraperError; data?: never };

export type Scraper<T> = (
  input: string | ParsedHtml
) => Promise<ScraperResult<T>>;
