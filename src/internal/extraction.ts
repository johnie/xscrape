import type { CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

import type { ExtractionError, ScraperPath } from "@/types/error";
import type {
  ExtractedRecord,
  ExtractNode,
  ExtractValueCallback,
} from "@/types/extract";

type Scope = ReturnType<CheerioAPI>;

type Reader =
  | { kind: "text" | "html" }
  | { kind: "attr" | "prop"; name: string }
  | { kind: "callback"; callback: ExtractValueCallback }
  | { kind: "object"; fields: ExtractionPlan };

interface CompiledField {
  key: string;
  selector: string;
  many: boolean;
  reader: Reader;
}

export type ExtractionPlan = readonly CompiledField[];

export class ExtractionFailureError extends Error {
  readonly details: ExtractionError;

  constructor(details: ExtractionError) {
    super(details.message, { cause: details.cause });
    this.name = "ExtractionFailureError";
    this.details = details;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const invalidConfig = (path: ScraperPath, message: string): never => {
  throw new ExtractionFailureError({
    code: "INVALID_CONFIG",
    message,
    path,
    stage: "extract",
  });
};

/** Copies configuration structure once. No compiled node captures a document. */
export const compileExtraction = (
  config: unknown,
  path: ScraperPath = [],
  ancestors = new Set<object>()
): ExtractionPlan => {
  if (!isRecord(config)) {
    return invalidConfig(path, "Extraction fields must be an object");
  }
  if (ancestors.has(config)) {
    return invalidConfig(
      path,
      "Extraction configuration must not contain cycles"
    );
  }

  ancestors.add(config);
  const plan = Object.entries(config).map(([key, raw]): CompiledField => {
    const fieldPath = [...path, key];
    let field = raw;
    let many = false;

    if (Array.isArray(field)) {
      if (field.length !== 1) {
        return invalidConfig(
          fieldPath,
          "Array shorthand must contain exactly one descriptor"
        );
      }
      [field] = field;
      many = true;
    } else if (isRecord(field) && field.kind === "many") {
      ({ field } = field);
      many = true;
    }

    if (typeof field === "string") {
      return { key, many, reader: { kind: "text" }, selector: field };
    }
    if (!isRecord(field) || typeof field.selector !== "string") {
      return invalidConfig(fieldPath, "Each field must have a selector string");
    }

    let reader: Reader;
    switch (field.kind) {
      case "text":
      case "html": {
        reader = { kind: field.kind };
        break;
      }
      case "attr":
      case "prop": {
        if (typeof field.name !== "string") {
          return invalidConfig(
            fieldPath,
            "Attribute and property descriptors require a name string"
          );
        }
        reader = { kind: field.kind, name: field.name };
        break;
      }
      case "object": {
        reader = {
          fields: compileExtraction(field.fields, fieldPath, ancestors),
          kind: "object",
        };
        break;
      }
      case undefined: {
        if (field.value === undefined) {
          reader = { kind: "text" };
        } else if (typeof field.value === "string") {
          reader = { kind: "prop", name: field.value };
        } else if (typeof field.value === "function") {
          // SAFETY: Callback inputs are supplied by this executor; its result stays unknown until validation.
          reader = {
            callback: field.value as ExtractValueCallback,
            kind: "callback",
          };
        } else {
          reader = {
            fields: compileExtraction(field.value, fieldPath, ancestors),
            kind: "object",
          };
        }
        break;
      }
      default: {
        return invalidConfig(fieldPath, "Unknown extraction descriptor kind");
      }
    }
    return { key, many, reader, selector: field.selector };
  });
  ancestors.delete(config);
  return plan;
};

const readAttribute = (node: Scope, name: string): string | undefined => {
  const [element] = node;
  // Cheerio's attr() normalizes boolean attributes. Read the parsed attribute to preserve the raw value.
  return element && "attribs" in element ? element.attribs[name] : undefined;
};

const createExtractNode = (node: Scope): ExtractNode => ({
  attr: (name) => readAttribute(node, name),
  html: () => node.html() ?? undefined,
  text: () => node.text(),
});

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  value !== null &&
  (typeof value === "object" || typeof value === "function") &&
  "then" in value &&
  typeof value.then === "function";

const silenceUnhandledRejection = async (
  promise: PromiseLike<unknown>
): Promise<void> => {
  try {
    await promise;
  } catch {
    // Prevent unhandled rejections if the callback promise rejects after being rejected by xscrape.
  }
};

type ExecutePlan = (
  scope: Scope,
  document: CheerioAPI,
  plan: ExtractionPlan,
  path?: ScraperPath
) => ExtractedRecord;

const readNode = (
  node: Scope,
  document: CheerioAPI,
  field: CompiledField,
  siblings: ExtractedRecord,
  path: ScraperPath,
  execute: ExecutePlan
): unknown => {
  switch (field.reader.kind) {
    case "text": {
      return node.text();
    }
    case "html": {
      return node.html() ?? undefined;
    }
    case "attr": {
      return readAttribute(node, field.reader.name);
    }
    case "prop": {
      return node.prop(field.reader.name);
    }
    case "object": {
      return execute(node, document, field.reader.fields, path);
    }
    case "callback": {
      const value = field.reader.callback(
        createExtractNode(node),
        field.key,
        siblings
      );
      if (isPromiseLike(value)) {
        void silenceUnhandledRejection(value);
        throw new ExtractionFailureError({
          code: "ASYNC_EXTRACTOR",
          message:
            "Extraction callbacks must be synchronous. Use schema validation or transform for async work.",
          path,
          selector: field.selector,
          stage: "extract",
        });
      }
      return value;
    }
    default: {
      throw new Error("Unknown compiled extraction reader");
    }
  }
};

export const executeExtraction: ExecutePlan = (
  scope,
  document,
  plan,
  path = []
) => {
  const result: ExtractedRecord = {};

  for (const field of plan) {
    const fieldPath = [...path, field.key];
    let matchIndex = 0;
    const descriptor = {
      selector: field.selector,
      value: (element: Element) => {
        const valuePath = field.many ? [...fieldPath, matchIndex] : fieldPath;
        matchIndex += 1;
        try {
          return readNode(
            document(element),
            document,
            field,
            result,
            valuePath,
            executeExtraction
          );
        } catch (error) {
          if (error instanceof ExtractionFailureError) {
            throw error;
          }
          throw new ExtractionFailureError({
            cause: error,
            code: "EXTRACTION_FAILED",
            message: "Could not extract field value",
            path: valuePath,
            selector: field.selector,
            stage: "extract",
          });
        }
      },
    };

    try {
      // Delegate selection to Cheerio to preserve first-match limits and nullish filtering/flattening in arrays.
      const { value } = scope.extract({
        value: field.many ? [descriptor] : descriptor,
      });
      // Define own keys so names such as __proto__ cannot change the result object's prototype.
      Object.defineProperty(result, field.key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
    } catch (error) {
      if (error instanceof ExtractionFailureError) {
        throw error;
      }
      throw new ExtractionFailureError({
        cause: error,
        code: "INVALID_SELECTOR",
        message: "Could not evaluate CSS selector",
        path: fieldPath,
        selector: field.selector,
        stage: "extract",
      });
    }
  }
  return result;
};
