/** Values are untrusted until the schema validates them. Callbacks may return Dates or other objects. */
export type ExtractedRecord = Record<string, unknown>;

export interface ExtractNode {
  readonly attr: (name: string) => string | undefined;
  readonly html: () => string | undefined;
  readonly text: () => string;
}

/** Synchronous only. Siblings contains only fields already extracted in this object. */
export type ExtractValueCallback<T = unknown> = (
  node: ExtractNode,
  key: string,
  siblings: Readonly<ExtractedRecord>
) => T | undefined;

type NestedConfig<T> = unknown extends T
  ? ExtractConfig
  : NonNullable<T> extends readonly unknown[]
    ? never
    : NonNullable<T> extends object
      ? ExtractConfig<NonNullable<T>>
      : never;

/** Legacy syntax. A string value reads a DOM property, not a raw attribute. */
export interface ExtractDescriptor<T = unknown> {
  readonly selector: string;
  readonly value?: string | ExtractValueCallback<T> | NestedConfig<T>;
}

export interface TextDescriptor {
  readonly kind: "text";
  readonly selector: string;
}

export interface HtmlDescriptor {
  readonly kind: "html";
  readonly selector: string;
}

export interface AttributeDescriptor {
  readonly kind: "attr";
  readonly selector: string;
  readonly name: string;
}

export interface PropertyDescriptor {
  readonly kind: "prop";
  readonly selector: string;
  readonly name: string;
}

export interface ObjectDescriptor<T = unknown> {
  readonly kind: "object";
  readonly selector: string;
  readonly fields: NestedConfig<T>;
}

export type SingleExtractField<T = unknown> =
  | string
  | ExtractDescriptor<T>
  | TextDescriptor
  | HtmlDescriptor
  | AttributeDescriptor
  | PropertyDescriptor
  | ObjectDescriptor<T>;

export interface ManyDescriptor<T = unknown> {
  readonly kind: "many";
  readonly field: SingleExtractField<T>;
}

type ArrayField<T> = unknown extends T
  ? ManyDescriptor | readonly [SingleExtractField]
  : T extends readonly (infer Item)[]
    ? ManyDescriptor<Item> | readonly [SingleExtractField<Item>]
    : never;

export type ExtractField<T = unknown> = SingleExtractField<T> | ArrayField<T>;

// Unknown/preprocessed inputs have no statically knowable keys. Validation remains authoritative.
type ExtractTarget<T> = [T] extends [never]
  ? ExtractedRecord
  : NonNullable<T> extends object
    ? NonNullable<T>
    : ExtractedRecord;

/** Mirrors schema input keys and their optionality, including fields supplied by defaults. */
export type ExtractConfig<T = unknown> = {
  readonly [K in keyof ExtractTarget<T>]: ExtractField<ExtractTarget<T>[K]>;
};
