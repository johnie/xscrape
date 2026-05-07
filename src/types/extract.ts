type ExtractObjectShape<T> =
  NonNullable<T> extends readonly unknown[]
    ? never
    : NonNullable<T> extends object
      ? NonNullable<T>
      : never;

export interface ExtractNode {
  attr(name: string): string | undefined;
  html(): string | undefined;
  text(): string;
}

export type ExtractValueCallback<T = unknown> = (
  node: ExtractNode,
  key: string,
  object: Record<string, unknown>,
) => T | undefined;

export interface ExtractDescriptor<T = unknown> {
  selector: string;
  value?:
    | string
    | ExtractValueCallback<T>
    | ExtractConfig<ExtractObjectShape<T>>;
}

export type ExtractField<T = unknown> =
  | string
  | ExtractDescriptor<T>
  | (T extends readonly (infer Item)[]
      ? [string | ExtractDescriptor<NonNullable<Item>>]
      : never);

type ExtractShape<T> = [T] extends [never]
  ? Record<string, unknown>
  : NonNullable<T> extends object
    ? NonNullable<T>
    : Record<string, unknown>;

export type ExtractConfig<T = Record<string, unknown>> = {
  [K in keyof ExtractShape<T>]: ExtractField<ExtractShape<T>[K]>;
};
