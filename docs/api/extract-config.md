---
outline: deep
---

# Extract Configuration

```ts
interface ExtractNode {
  attr(name: string): string | undefined;
  text(): string;
  html(): string | undefined;
}

type ExtractDescriptor = {
  selector: string;
  value?:
    | string // attribute name
    | ((node: ExtractNode) => unknown)
    | ExtractConfig;
};
type ExtractConfig = Record<
  string,
  string | ExtractDescriptor | [string | ExtractDescriptor]
>;
```

- **selector**: CSS selector
- **value**:
  - _string_: attribute
  - _fn_: custom extractor receiving an xscrape `ExtractNode`
  - _object_: nested
  - _undefined_: text

Arrays: wrap descriptor in `[ ]`.
