export type ScrapeConfig<T> = {
  fields: SchemaFieldDefinitions<T>;
  validator: SchemaValidator<T>;
};

export type FieldDefinition<T> =
  | {
      selector: string;
      attribute?: string;
      transform?: (value: string) => T;
      defaultValue?: T;
      multiple?: boolean;
    }
  | NestedFieldDefinition<T>;

type NestedFieldDefinition<T> = {
  fields: SchemaFieldDefinitions<T>;
};

export type SchemaFieldDefinitions<T> = {
  [K in keyof T]: FieldDefinition<T[K]>;
};

export interface SchemaValidator<T> {
  validate(data: unknown): T;
}
