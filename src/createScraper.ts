import * as cheerio from 'cheerio';
import { type ScrapeConfig } from '@/types.js';

export const createScraper = <T>({
  fields,
  validator,
}: ScrapeConfig<T>): ((html: string) => T) => {
  return (html: string): T => {
    const $ = cheerio.load(html);
    const data: Partial<Record<keyof T, unknown>> = {};

    for (const key in fields) {
      const fieldDef = fields[key];
      const elements = $(fieldDef.selector);

      let values: string[] = [];

      elements.each((_, element) => {
        const value = fieldDef.attribute
          ? $(element).attr(fieldDef.attribute)
          : $(element).text();

        if (value !== undefined) {
          values.push(value);
        }
      });

      if (values.length === 0 && fieldDef.defaultValue !== undefined) {
        data[key] = fieldDef.defaultValue;
      } else if (fieldDef.multiple) {
        data[key] = values.map((value) =>
          fieldDef.transform ? fieldDef.transform(value) : value,
        );
      } else {
        const value = values[0];
        data[key] =
          fieldDef.transform && value ? fieldDef.transform(value) : value;
      }
    }

    return validator.validate(data);
  };
};
