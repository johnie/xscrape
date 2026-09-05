import { defineScraper } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: {
    published: {
      selector: "time",
      value: (node) => new Date(node.attr("datetime") ?? ""),
    },
    tags: {
      selector: 'meta[name="keywords"]',
      value: (node) =>
        node
          .attr("content")
          ?.split(",")
          .map((tag) => tag.trim()) ?? [],
    },
  },
  schema: z.object({
    published: z.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const result = await scrape(`
  <meta name="keywords" content="html, typescript">
  <time datetime="2026-01-01">January 1</time>
`);
// Callbacks are synchronous and only run for matched elements.
// Put async work in schema validation or transform instead.
