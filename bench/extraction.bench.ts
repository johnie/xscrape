import { load } from "cheerio";
import { bench, describe } from "vitest";
import { z } from "zod";

import { attr, defineScraper, many, parseHtml, text } from "@/index";

const options = { iterations: 20, time: 200, warmupTime: 100 };
const schema = z.record(z.string(), z.unknown());

for (const rows of [10, 200, 2000]) {
  const markup = `<title>Catalog</title>${'<article><h2>Product</h2><a href="/item">Buy</a><span>42</span></article>'.repeat(rows)}`;
  const extract = {
    products: many("article", {
      name: text("h2"),
      price: {
        selector: "span",
        value: (node: { text: () => string }) => Number(node.text()),
      },
      url: attr("a", "href"),
    }),
    title: text("title"),
  };
  const scrape = defineScraper({ extract, schema });
  const document = parseHtml(markup);

  describe(`${rows} rows, ${Buffer.byteLength(markup)} bytes, nested arrays and callbacks`, () => {
    bench(
      "parse only",
      () => {
        parseHtml(markup);
      },
      options
    );
    bench(
      "compile only",
      () => {
        defineScraper({ extract, schema });
      },
      options
    );
    bench(
      "extract and validate a reused document",
      async () => {
        const result = await scrape(document);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
      },
      options
    );
    bench(
      "parse, extract and validate",
      async () => {
        const result = await scrape(markup);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
      },
      options
    );
    bench(
      "Cheerio parse and equivalent extraction, no validation",
      () => {
        const $ = load(markup);
        $.extract({
          products: [
            {
              selector: "article",
              value: {
                name: "h2",
                price: {
                  selector: "span",
                  value: (element) => Number($(element).text()),
                },
                url: { selector: "a", value: "href" },
              },
            },
          ],
          title: "title",
        });
      },
      options
    );
  });
}

const markup = `<main>${"<h2>Heading</h2>".repeat(200)}</main>`;
for (const fieldCount of [1, 10, 50]) {
  const extract = Object.fromEntries(
    Array.from({ length: fieldCount }, (_, index) => [
      `field${index}`,
      text("h2"),
    ])
  );
  const scrape = defineScraper({ extract, schema });
  const document = parseHtml(markup);
  describe(`${fieldCount} scalar selectors`, () => {
    bench(
      "reused document",
      async () => {
        const result = await scrape(document);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
      },
      options
    );
  });
}
