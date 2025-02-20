import { z } from 'zod';
import type { ExtractMap } from './cheerio.js';

export type ValidatorType = 'zod';

type ZodBuilder = typeof z;

export type SchemaBuilder<V extends ValidatorType> = V extends 'zod'
  ? ZodBuilder
  : never;

export type SchemaFunction<V extends ValidatorType, T> = (
  builder: SchemaBuilder<V>,
) => V extends 'zod' ? z.ZodSchema<T> : never;

export type ScraperConfig<
  T extends Record<string, unknown>,
  V extends ValidatorType,
  R extends T = T,
> = {
  validator: V;
  schema: SchemaFunction<V, T>;
  extract: ExtractMap;
  transform?: (data: T) => Promise<R> | R;
};

type BaseFieldOptions = {
  attribute?: string;
};

export type LeafFieldConfig = BaseFieldOptions & {
  selector?: string;
  selectorAll?: string;
} & (
    | { selector: string; selectorAll?: never }
    | { selector?: never; selectorAll: string }
  );

export type FieldConfig<T> = T extends object
  ? T extends Array<infer U>
    ? LeafFieldConfig
    : {
        fields: Fields<T>;
      }
  : LeafFieldConfig;

export type Fields<T> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: unknown;
};

export type ScraperResult<T> = {
  data?: T;
  error?: unknown;
};
