import type { StandardSchemaV1 } from "@standard-schema/spec";

import type {
  ScraperDiagnostic,
  ScraperError,
  ScraperPath,
} from "@/types/error";

const issuePath = (
  path: StandardSchemaV1.Issue["path"]
): ScraperPath | undefined =>
  path?.map((segment) => {
    const key = typeof segment === "object" ? segment.key : segment;
    return typeof key === "number" ? key : String(key);
  });

/** JSON-safe error details for logs and agent tools. Original exceptions stay on error.cause. */
export const toDiagnostic = (error: ScraperError): ScraperDiagnostic => {
  const diagnostic = {
    code: error.code,
    message: error.message,
    stage: error.stage,
  };

  if (error.stage === "extract") {
    return { ...diagnostic, path: error.path, selector: error.selector };
  }

  if (error.code === "VALIDATION_FAILED") {
    return {
      ...diagnostic,
      issues: error.issues.map((issue) => ({
        message: issue.message,
        path: issuePath(issue.path),
      })),
    };
  }

  return diagnostic;
};
