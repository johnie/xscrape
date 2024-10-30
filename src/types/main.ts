import { z } from 'zod';
import { Schema } from 'effect';
import type { ExtractMap } from './cheerio.js';

export type ValidatorType = 'zod' | 'effect';

type ZodBuilder = typeof z;
type EffectBuilder = typeof Schema;

export type SchemaBuilder<V extends ValidatorType> = V extends 'zod'
  ? ZodBuilder
  : V extends 'effect'
    ? EffectBuilder
    : never;

export type SchemaFunction<V extends ValidatorType, T> = (
  builder: SchemaBuilder<V>,
) => V extends 'zod'
  ? z.ZodSchema<T>
  : V extends 'effect'
    ? Schema.Schema<T>
    : never;

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
