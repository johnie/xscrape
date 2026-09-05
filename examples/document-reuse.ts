import { attr, defineScraper, many, parseHtml, text } from "xscrape";
import { z } from "zod";

const titles = defineScraper({
  extract: { title: text("title") },
  schema: z.object({ title: z.string() }),
});
const links = defineScraper({
  extract: { links: many(attr("a", "href")) },
  schema: z.object({ links: z.array(z.string()) }),
});

// parseHtml is explicit and can throw on invalid input. The handle exposes no mutable DOM.
const document = parseHtml('<title>Example</title><a href="/docs">Docs</a>');
export const results = await Promise.all([titles(document), links(document)]);
// Parsing happens once. Each scraper still extracts and validates its own result.
