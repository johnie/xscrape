# Errors

Branch on `result.ok`. Error causes can be falsy, and successful data can be `undefined`.

| Stage | Code | Meaning |
| --- | --- | --- |
| extract | `INVALID_CONFIG` | Malformed or cyclic extraction structure |
| extract | `INVALID_DOCUMENT` | Unsupported input or HTML parsing failure |
| extract | `INVALID_SELECTOR` | Cheerio could not evaluate the selector |
| extract | `EXTRACTION_FAILED` | A field reader or callback threw |
| extract | `ASYNC_EXTRACTOR` | A callback returned a promise-like value |
| validate | `VALIDATION_FAILED` | The schema returned issues |
| validate | `VALIDATION_EXCEPTION` | The validator threw or rejected |
| validate | `INVALID_VALIDATION_RESULT` | The validator returned no usable result or successful value |
| transform | `TRANSFORM_FAILED` | The transform threw or rejected |

All errors have `stage`, `code`, and `message`. When known, extraction errors include `path` and `selector`. Nested collection paths look like `["products", 3, "price"]`, with zero-based DOM match indices before nullish filtering. `VALIDATION_FAILED` preserves the original Standard Schema `issues`. Exceptions preserve their thrown value in `cause`.

`toDiagnostic(error)` returns JSON-safe details without arbitrary causes. Validation path segments become strings or numbers. Undefined optional properties are omitted when serialized. This does not sanitize successful data or make callbacks safe to execute.

<!-- example: errors -->

```typescript
import { defineScraper, text, toDiagnostic } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: { title: text("title") },
  schema: z.object({ title: z.string() }),
});

export const result = await scrape("<body>No title</body>");
if (!result.ok) {
  // Logs { code: "VALIDATION_FAILED", stage: "validate", message: "...", issues: [...] }
  console.error(toDiagnostic(result.error));
  if (result.error.code === "VALIDATION_FAILED") {
    // Original Standard Schema issues, including paths.
    console.error(result.error.issues);
  }
}
// Use result.ok, never the truthiness of data or error.cause.
```

<!-- /example -->

Malformed descriptors and selectors require correcting the extraction config. Missing-data validation issues may require a selector correction or a deliberate schema default. Callback and transform exceptions usually require fixing application code. None of these imply that a network retry will help; xscrape does not fetch documents.
