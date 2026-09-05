import type { StandardSchemaV1 } from "@standard-schema/spec";

import { resolveDocument } from "@/internal/document";
import {
  compileExtraction,
  executeExtraction,
  ExtractionFailureError,
} from "@/internal/extraction";
import type { ExtractionPlan } from "@/internal/extraction";
import type { ExtractedRecord } from "@/types/extract";
import type { Scraper, ScraperConfig, ScraperResult } from "@/types/main";

const prepareExtraction = (config: unknown): ScraperResult<ExtractionPlan> => {
  try {
    return { data: compileExtraction(config), ok: true };
  } catch (error) {
    if (error instanceof ExtractionFailureError) {
      return { error: error.details, ok: false };
    }
    return {
      error: {
        cause: error,
        code: "INVALID_CONFIG",
        message: "Could not read extraction configuration",
        stage: "extract",
      },
      ok: false,
    };
  }
};

const validateExtractedData = async <S extends StandardSchemaV1>(
  schema: S,
  data: ExtractedRecord
): Promise<ScraperResult<StandardSchemaV1.InferOutput<S>>> => {
  try {
    const result = await schema["~standard"].validate(data);
    if (!result || typeof result !== "object") {
      return {
        error: {
          code: "INVALID_VALIDATION_RESULT",
          message: "Validator returned an invalid result",
          stage: "validate",
        },
        ok: false,
      };
    }
    if (result.issues) {
      return {
        error: {
          code: "VALIDATION_FAILED",
          issues: result.issues,
          message: "Extracted data did not match the schema",
          stage: "validate",
        },
        ok: false,
      };
    }
    if (!("value" in result)) {
      return {
        error: {
          code: "INVALID_VALIDATION_RESULT",
          message: "Validation succeeded but no data was returned",
          stage: "validate",
        },
        ok: false,
      };
    }
    return { data: result.value, ok: true };
  } catch (error) {
    return {
      error: {
        cause: error,
        code: "VALIDATION_EXCEPTION",
        message: "Schema validation threw an exception",
        stage: "validate",
      },
      ok: false,
    };
  }
};

export const createScraperRuntime = <S extends StandardSchemaV1, R>(
  config: ScraperConfig<S, R>
): Scraper<StandardSchemaV1.InferOutput<S> | Awaited<R>> => {
  // Snapshot configuration once; schema and callback objects remain the caller's responsibility.
  const prepared = prepareExtraction(config.extract);
  const { schema, transform } = config;

  return async (input) => {
    if (!prepared.ok) {
      return prepared;
    }

    let extracted: ExtractedRecord;
    try {
      const document = resolveDocument(input);
      extracted = executeExtraction(document.root(), document, prepared.data);
    } catch (error) {
      if (error instanceof ExtractionFailureError) {
        return { error: error.details, ok: false };
      }
      return {
        error: {
          cause: error,
          code: "INVALID_DOCUMENT",
          message: "Could not parse the input document",
          stage: "extract",
        },
        ok: false,
      };
    }

    const validation = await validateExtractedData(schema, extracted);
    if (!validation.ok || !transform) {
      return validation;
    }

    try {
      return { data: await transform(validation.data), ok: true };
    } catch (error) {
      return {
        error: {
          cause: error,
          code: "TRANSFORM_FAILED",
          message: "Transform threw an exception",
          stage: "transform",
        },
        ok: false,
      };
    }
  };
};
