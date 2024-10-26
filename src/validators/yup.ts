import { type SchemaValidator } from '@/types.js';
import * as yup from 'yup';

export class YupValidator<T> implements SchemaValidator<T> {
  constructor(private schema: yup.Schema<T>) {}

  validate(data: unknown): T {
    try {
      return this.schema.validateSync(data, {
        stripUnknown: true,
        strict: false,
        abortEarly: false,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new Error(this.formatError(error));
      }
      throw error;
    }
  }

  private formatError(error: yup.ValidationError): string {
    return error.errors.join('\n');
  }
}
