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
