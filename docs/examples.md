# Schema library examples

All four libraries use the same extraction config. Effect Schema needs the `standardSchemaV1` adapter.

<!-- example: schemas -->

```typescript
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type } from "arktype";
import { Schema } from "effect";
import { object, string } from "valibot";
import { z } from "zod";

// Each schema accepts { title: string } and works with the same extraction config.
export const compatibilityCases = [
  { name: "Zod", schema: z.object({ title: z.string() }) },
  { name: "Valibot", schema: object({ title: string() }) },
  { name: "Arktype", schema: type({ title: "string" }) },
  {
    name: "Effect Schema",
    schema: Schema.standardSchemaV1(Schema.Struct({ title: Schema.String })),
  },
] satisfies { name: string; schema: StandardSchemaV1 }[];
```

<!-- /example -->

These exact schemas are exercised by compatibility tests for both successful extraction and missing required fields.

Other runnable examples: [quick start](quick-start.md), [nested arrays](guide/arrays.md), [callbacks](guide/custom-values.md), [transforms](guide/custom-transform.md), [missing data](guide/missing-data.md), and [errors](api/errors.md).
