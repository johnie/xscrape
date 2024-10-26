import * as cheerio from 'cheerio';
import { type ScrapeConfig, type SchemaFieldDefinitions } from '@/types.js';

const extractData = <U>(
  fields: SchemaFieldDefinitions<U>,
  $context: cheerio.CheerioAPI,
): Partial<U> => {
  const data: Partial<U> = {};

  for (const key in fields) {
    const fieldDef = fields[key];

    if ('fields' in fieldDef) {
      const nestedData = extractData(
        fieldDef.fields as SchemaFieldDefinitions<U[typeof key]>,
        $context,
      );

      data[key as keyof U] = nestedData as U[typeof key];
    } else {
      const elements = $context(fieldDef.selector);
      let values: string[] = [];

      elements.each((_, element) => {
        const value = fieldDef.attribute
          ? $context(element).attr(fieldDef.attribute)
          : $context(element).text().trim();

        if (value !== undefined) {
          values.push(value);
        }
      });

      if (values.length === 0 && fieldDef.defaultValue !== undefined) {
        data[key as keyof U] = fieldDef.defaultValue as U[typeof key];
      } else if (fieldDef.multiple) {
        data[key as keyof U] = values.map((value) =>
          fieldDef.transform ? fieldDef.transform(value) : value,
        ) as U[typeof key];
      } else {
        const value = values[0];
        data[key as keyof U] = (
          fieldDef.transform && value ? fieldDef.transform(value) : value
        ) as U[typeof key];
      }
    }
  }

  return data;
};

export const createScraper = <T>({
  fields,
  validator,
}: ScrapeConfig<T>): ((html: cheerio.CheerioAPI | string) => T) => {
  return (html: cheerio.CheerioAPI | string): T => {
    const $ = typeof html === 'string' ? cheerio.load(html) : html;
    const data = extractData(fields, $);
    return validator.validate(data);
  };
};
