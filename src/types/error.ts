import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ScraperPath = readonly (string | number)[];

interface ErrorDetails {
  readonly message: string;
  /** Original exception. Omitted by toDiagnostic because arbitrary causes need not be JSON-safe. */
  readonly cause?: unknown;
}

export interface ExtractionError extends ErrorDetails {
  readonly stage: "extract";
  readonly code:
    | "INVALID_CONFIG"
    | "INVALID_DOCUMENT"
    | "INVALID_SELECTOR"
    | "EXTRACTION_FAILED"
    | "ASYNC_EXTRACTOR";
  readonly path?: ScraperPath;
  readonly selector?: string;
}

export interface ValidationError extends ErrorDetails {
  readonly stage: "validate";
  readonly code: "VALIDATION_FAILED";
  readonly issues: readonly StandardSchemaV1.Issue[];
}

export interface ValidatorError extends ErrorDetails {
  readonly stage: "validate";
  readonly code: "VALIDATION_EXCEPTION" | "INVALID_VALIDATION_RESULT";
}

export interface TransformError extends ErrorDetails {
  readonly stage: "transform";
  readonly code: "TRANSFORM_FAILED";
}

export type ScraperError =
  | ExtractionError
  | ValidationError
  | ValidatorError
  | TransformError;

export interface ScraperDiagnostic {
  readonly stage: ScraperError["stage"];
  readonly code: ScraperError["code"];
  readonly message: string;
  readonly path?: ScraperPath;
  readonly selector?: string;
  readonly issues?: readonly { message: string; path?: ScraperPath }[];
}
