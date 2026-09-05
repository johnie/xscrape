import { attr, defineScraper, many, text } from "xscrape";
import { z } from "zod";

const scrape = defineScraper({
  extract: {
    products: many("article", {
      name: text("h2"),
      price: text("span"),
      url: attr("a", "href"),
    }),
  },
  schema: z.object({
    products: z.array(
      z.object({
        name: z.string(),
        price: z.coerce.number(),
        url: z.string(),
      })
    ),
  }),
});

export const result = await scrape(`
  <article><h2>Book</h2><span>12</span><a href="/book">Buy</a></article>
  <article><h2>Pen</h2><span>3</span><a href="/pen">Buy</a></article>
`);
// Relative hrefs stay relative. Resolve them against a trusted base URL if needed.
