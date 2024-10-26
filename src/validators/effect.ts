import { type SchemaValidator } from '@/types.js';
import * as Schema from 'effect/Schema';
import { Effect } from 'effect';

export class EffectValidator<A, I = A> implements SchemaValidator<A> {
  constructor(private schema: Schema.Schema<A, I>) {}

  validate(data: unknown): A {
    const result = Schema.decodeUnknown(this.schema)(data);

    return Effect.runSync(result);
  }
}
