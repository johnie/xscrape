import { load } from "cheerio";
import type { CheerioAPI } from "cheerio";

const documentBrand: unique symbol = Symbol("xscrape.ParsedHtml");

/** Opaque, read-only document handle. DOM state stays private to xscrape. */
export interface ParsedHtml {
  readonly [documentBrand]: true;
}

const documents = new WeakMap<ParsedHtml, CheerioAPI>();

/** Parse once for reuse by multiple scrapers. Does not fetch URLs or execute scripts. */
export const parseHtml = (html: string): ParsedHtml => {
  if (typeof html !== "string") {
    throw new TypeError("xscrape: parseHtml expects an HTML string");
  }

  const document: ParsedHtml = Object.freeze({
    [documentBrand]: true as const,
  });
  documents.set(document, load(html));
  return document;
};

export const resolveDocument = (input: string | ParsedHtml): CheerioAPI => {
  if (typeof input === "string") {
    return load(input);
  }

  const document = documents.get(input);
  if (!document) {
    throw new TypeError(
      "xscrape: Expected an HTML string or a handle returned by parseHtml"
    );
  }
  return document;
};
