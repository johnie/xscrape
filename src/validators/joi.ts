import { type SchemaValidator } from '@/types.js';
import type { Schema, ValidationError } from 'joi';

export class JoiValidator<T> implements SchemaValidator<T> {
  constructor(private schema: Schema<T>) {}

  validate(data: unknown): T {
    const { error, value } = this.schema.validate(data, {
      convert: true,
      stripUnknown: true,
      presence: 'optional',
      abortEarly: false,
    });

    if (error) {
      throw new Error(this.formatError(error));
    }

    return value;
  }

  private formatError(error: ValidationError): string {
    return error.details.map((detail) => detail.message).join('\n');
  }
}
