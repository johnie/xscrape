---
outline: deep
---

# Extract Configuration

```ts
type ExtractDescriptor = {
  selector: string;
  value?:
    | string // attribute name
    | ((el: Element) => any)
    | Record<string, ExtractDescriptor>;
};
type ExtractConfig = Record<string, ExtractDescriptor | [ExtractDescriptor]>;
```

- **selector**: CSS selector
- **value**:
  - _string_: attribute
  - _fn_: custom extractor
  - _object_: nested
  - _undefined_: text

Arrays: wrap descriptor in `[ ]`.
