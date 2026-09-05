import type {
  AttributeDescriptor,
  ExtractConfig,
  HtmlDescriptor,
  PropertyDescriptor,
  SingleExtractField,
  TextDescriptor,
} from "@/types/extract";

export const text = (selector: string): TextDescriptor => ({
  kind: "text",
  selector,
});

export const html = (selector: string): HtmlDescriptor => ({
  kind: "html",
  selector,
});

/** Read a raw attribute. Missing attributes return undefined; boolean attributes can be empty strings. */
export const attr = (selector: string, name: string): AttributeDescriptor => ({
  kind: "attr",
  name,
  selector,
});

/** Read a DOM property, preserving the legacy string-value semantics. */
export const prop = (selector: string, name: string): PropertyDescriptor => ({
  kind: "prop",
  name,
  selector,
});

export const nested = <const F extends ExtractConfig>(
  selector: string,
  fields: F
) => ({
  fields,
  kind: "object" as const,
  selector,
});

export function many<const F extends SingleExtractField>(
  field: F
): { kind: "many"; field: F };
export function many<const F extends ExtractConfig>(
  selector: string,
  fields: F
): { kind: "many"; field: { kind: "object"; selector: string; fields: F } };
export function many(field: SingleExtractField, fields?: ExtractConfig) {
  if (fields !== undefined) {
    if (typeof field !== "string") {
      throw new TypeError(
        "xscrape: many(selector, fields) expects a selector string"
      );
    }
    return { field: nested(field, fields), kind: "many" as const };
  }
  return { field, kind: "many" as const };
}
