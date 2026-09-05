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
