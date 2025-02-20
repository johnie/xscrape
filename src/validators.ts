import type {
  ValidationResult,
  SchemaBuilder,
  SchemaFunction,
  ValidatorType,
} from '@/types/main.js';
import { z } from 'zod';

class Validator<T> implements SchemaValidator<T> {
  constructor(
    private schema: unknown,
    private validateFunction: (schema: unknown, data: unknown) => T,
  ) {}

  validate(data: unknown): ValidationResult<T> {
    try {
      const result = this.validateFunction(this.schema, data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }
}

interface SchemaValidator<T> {
  validate(data: unknown): ValidationResult<T>;
}

export function getSchemaBuilder<V extends ValidatorType>(
  type: V,
): SchemaBuilder<V> {
  switch (type) {
    case 'zod':
      return z as SchemaBuilder<V>;
    default:
      throw new Error(`Unsupported validator type: ${type}`);
  }
}

export function createValidator<T, V extends ValidatorType>(
  type: V,
  schemaFn: SchemaFunction<V, T>,
): SchemaValidator<T> {
  const builder = getSchemaBuilder(type);
  const schema = schemaFn(builder);

  switch (type) {
    case 'zod':
      return new Validator<T>(schema, (schema, data) =>
        (schema as z.ZodSchema<T>).parse(data),
      );
    default:
      throw new Error(`Unsupported validator type: ${type}`);
  }
}
