import type { StandardSchemaV1 } from "@standard-schema/spec";

import { createScraperRuntime } from "@/internal/runtime";
import type { Scraper, ScraperConfig } from "@/types/main";

export { toDiagnostic } from "@/errors";
export { attr, html, many, nested, prop, text } from "@/helpers";
export { parseHtml, type ParsedHtml } from "@/internal/document";
export type {
  ExtractionError,
  ScraperDiagnostic,
  ScraperError,
  ScraperPath,
  TransformError,
  ValidationError,
  ValidatorError,
} from "@/types/error";
export type {
  AttributeDescriptor,
  ExtractConfig,
  ExtractDescriptor,
  ExtractedRecord,
  ExtractField,
  ExtractNode,
  ExtractValueCallback,
  HtmlDescriptor,
  ManyDescriptor,
  ObjectDescriptor,
  PropertyDescriptor,
  SingleExtractField,
  TextDescriptor,
} from "@/types/extract";
export type { Scraper, ScraperConfig, ScraperResult } from "@/types/main";

/** Snapshot an extraction configuration and return a reusable, non-throwing async scraper. */
export function defineScraper<S extends StandardSchemaV1, R>(
  config: ScraperConfig<S, R> & {
    transform: NonNullable<ScraperConfig<S, R>["transform"]>;
  }
): Scraper<Awaited<R>>;
export function defineScraper<S extends StandardSchemaV1>(
  config: ScraperConfig<S> & { transform?: undefined }
): Scraper<StandardSchemaV1.InferOutput<S>>;
export function defineScraper<
  S extends StandardSchemaV1,
  R = StandardSchemaV1.InferOutput<S>,
>(
  config: ScraperConfig<S, R>
): Scraper<StandardSchemaV1.InferOutput<S> | Awaited<R>>;
export function defineScraper<S extends StandardSchemaV1, R>(
  config: ScraperConfig<S, R>
) {
  return createScraperRuntime(config);
}
