import { ZodSchema } from 'zod';
import { type SchemaValidator } from '@/types.js';

export class ZodValidator<T> implements SchemaValidator<T> {
  constructor(private schema: ZodSchema<T>) {}

  validate(data: unknown): T {
    return this.schema.parse(data);
  }
}
