import type { Element } from 'domhandler';

interface StyleProp {
  length: number;
  [key: string]: string | number;
  [index: number]: string;
}

type PropType = string | undefined | null | Element[keyof Element] | StyleProp;

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

export interface ExtractMap {
  [key: string]: ExtractValue;
}

type ExtractedValue<V extends ExtractValue, M extends ExtractMap> = V extends [
  string | ExtractDescriptor,
]
  ? NonNullable<ExtractedValue<V[0], M>>[]
  : V extends string
    ? string | undefined
    : V extends ExtractDescriptor
      ? V['value'] extends ExtractMap
        ? ExtractedMap<V['value']> | undefined
        : V['value'] extends ExtractDescriptorFn
          ? ReturnType<V['value']> | undefined
          : PropType | undefined
      : never;

export type ExtractedMap<M extends ExtractMap> = {
  [key in keyof M]: ExtractedValue<M[key], M>;
};
