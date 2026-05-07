import type { StandardSchemaV1 } from '@standard-schema/spec';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type {
  ExtractConfig,
  ExtractDescriptor,
  ExtractField,
  ExtractNode,
} from '@/types/extract';
import type { ScraperConfig, ScraperResult } from '@/types/main';

type LoadedDocument = ReturnType<typeof load>;

type InternalExtractFn = (
  el: Element,
  key: string,
  obj: Record<string, unknown>,
) => unknown;

interface InternalExtractDescriptor {
  selector: string;
  value?: string | InternalExtractFn | InternalExtractMap;
}

type InternalExtractValue =
  | string
  | InternalExtractDescriptor
  | [string | InternalExtractDescriptor];

type InternalExtractMap = Record<string, InternalExtractValue>;

type ValidationStageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown };

export function createScraperRuntime<
  S extends StandardSchemaV1,
  R extends StandardSchemaV1.InferOutput<S> = StandardSchemaV1.InferOutput<S>,
>(config: ScraperConfig<S, R>): (html: string) => Promise<ScraperResult<R>> {
  return async (html: string): Promise<ScraperResult<R>> => {
    try {
      const extractedData = extractHtml(html, config.extract);
      const validation = await validateExtractedData(
        config.schema,
        extractedData,
      );

      if (!validation.ok) {
        return { error: validation.error };
      }

      const transformed = await transformValidatedData(
        validation.value,
        config.transform,
      );

      return { data: transformed as R };
    } catch (error) {
      return { error };
    }
  };
}

function extractHtml<T extends object>(
  html: string,
  extract: ExtractConfig<T>,
): T {
  const $ = load(html);
  const plan = compileExtractConfig(
    $,
    extract as ExtractConfig<Record<string, unknown>>,
  );

  return $.extract(plan) as T;
}

async function validateExtractedData<S extends StandardSchemaV1>(
  schema: S,
  extractedData: unknown,
): Promise<ValidationStageResult<StandardSchemaV1.InferOutput<S>>> {
  const validationResult = await Promise.resolve(
    schema['~standard'].validate(extractedData),
  );

  if (validationResult.issues) {
    return { ok: false, error: validationResult.issues };
  }

  if (!('value' in validationResult)) {
    return {
      ok: false,
      error: new Error(
        'xscrape: Validation succeeded but no data was returned',
      ),
    };
  }

  return { ok: true, value: validationResult.value };
}

function transformValidatedData<T, R extends T = T>(
  value: T,
  transform: ((data: T) => Promise<R> | R) | undefined,
): Promise<R | T> {
  return Promise.resolve(transform ? transform(value) : value);
}

function compileExtractConfig(
  $: LoadedDocument,
  extract: ExtractConfig<Record<string, unknown>>,
): InternalExtractMap {
  return Object.fromEntries(
    Object.entries(extract).map(([key, value]) => [
      key,
      compileExtractField($, value),
    ]),
  );
}

function compileExtractField(
  $: LoadedDocument,
  field: ExtractField<unknown>,
): InternalExtractValue {
  if (Array.isArray(field)) {
    return [compileArrayItem($, field[0])];
  }

  if (typeof field === 'string') {
    return field;
  }

  return compileExtractDescriptor($, field);
}

function compileArrayItem(
  $: LoadedDocument,
  field: string | ExtractDescriptor<unknown>,
): string | InternalExtractDescriptor {
  if (typeof field === 'string') {
    return field;
  }

  return compileExtractDescriptor($, field);
}

function compileExtractDescriptor(
  $: LoadedDocument,
  descriptor: ExtractDescriptor<unknown>,
): InternalExtractDescriptor {
  const { value } = descriptor;
  const compiled: InternalExtractDescriptor = {
    selector: descriptor.selector,
  };

  if (value === undefined) {
    return compiled;
  }

  if (typeof value === 'string') {
    compiled.value = value;
    return compiled;
  }

  if (typeof value === 'function') {
    compiled.value = (element, key, obj) =>
      value(createExtractNode($, element), key, obj);
    return compiled;
  }

  compiled.value = compileExtractConfig(
    $,
    value as ExtractConfig<Record<string, unknown>>,
  );

  return compiled;
}

function createExtractNode($: LoadedDocument, element: Element): ExtractNode {
  return {
    attr(name) {
      return element.attribs[name] ?? undefined;
    },
    text() {
      return $(element).text();
    },
    html() {
      return $(element).html() ?? undefined;
    },
  };
}
