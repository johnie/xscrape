import type { Element } from 'domhandler';

// Re-define the types you need
type ExtractDescriptorFn = (
  el: Element,
  key: string,
  obj: Record<string, unknown>,
) => unknown;

interface ExtractDescriptor {
  selector: string;
  value?: string | ExtractDescriptorFn | ExtractMap;
}

type ExtractValue = string | ExtractDescriptor | [string | ExtractDescriptor];

export type ExtractMap = Record<string, ExtractValue>;

type ExtractedValue<V extends ExtractValue> = V extends [
  string | ExtractDescriptor,
]
  ? NonNullable<ExtractedValue<V[0]>>[]
  : V extends string
    ? string | undefined
    : V extends ExtractDescriptor
      ? V['value'] extends infer U
        ? U extends ExtractMap
          ? ExtractedMap<U> | undefined
          : U extends ExtractDescriptorFn
            ? ReturnType<U> | undefined
            : string | undefined
        : never
      : never;

export type ExtractedMap<M extends ExtractMap> = {
  [key in keyof M]: ExtractedValue<M[key]>;
};
