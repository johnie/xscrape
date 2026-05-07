# xscrape

## 3.2.1

### Patch Changes

- [#60](https://github.com/johnie/xscrape/pull/60) [`a70fb58`](https://github.com/johnie/xscrape/commit/a70fb584957ab2df6b96912bd696726d4d50461b) Thanks [@johnie](https://github.com/johnie)! - Internal cleanup with no public API changes.

  - Refactor `src/internal/runtime.ts` for clarity: collapse `transformValidatedData`, split `compileExtractDescriptor` into a shape function plus a `compileDescriptorValue` helper, and inline the single-call `compileArrayItem` into `compileExtractField`
  - Bump dev dependencies: `tsdown` 0.21 → 0.22, `valibot` 1.3 → 1.4, `vite` 8.0.10 → 8.0.11
  - Bump `packageManager` to `pnpm@11.0.8`

## 3.2.0

### Minor Changes

- [#57](https://github.com/johnie/xscrape/pull/57) [`0359e19`](https://github.com/johnie/xscrape/commit/0359e19f240adabdf825fbd72bb231bd67127e34) Thanks [@johnie](https://github.com/johnie)! - Replace Cheerio with custom runtime for HTML extraction

  - Custom Runtime: Replaced Cheerio with a custom runtime for HTML extraction, improving performance and flexibility
  - New Extract Types: Added dedicated `ExtractConfig` and related types for better type safety and developer experience
  - Enhanced Documentation: Updated API docs and README with new runtime and type information
  - New Tests: Added compatibility and runtime tests for the new implementation
  - Updated dependencies and configuration files

## 3.0.4

### Patch Changes

- [#24](https://github.com/johnie/xscrape/pull/24) [`c6490ad`](https://github.com/johnie/xscrape/commit/c6490addca09fb23a0405d9aa978112868c022d6) Thanks [@johnie](https://github.com/johnie)! - audit fixes

## 3.0.3

### Patch Changes

- [#21](https://github.com/johnie/xscrape/pull/21) [`7130963`](https://github.com/johnie/xscrape/commit/713096321fe0885dc9f747975804ac4b895580e0) Thanks [@johnie](https://github.com/johnie)! - Minor tweaks

## 3.0.2

### Patch Changes

- [#18](https://github.com/johnie/xscrape/pull/18) [`d6231c0`](https://github.com/johnie/xscrape/commit/d6231c0ebb31c7e8be310dd23a7085a148047112) Thanks [@johnie](https://github.com/johnie)! - Fix bug where schema didn't affect extract method.

- [#16](https://github.com/johnie/xscrape/pull/16) [`783f96d`](https://github.com/johnie/xscrape/commit/783f96df457f685bc77f79d52af0f0dc663c662c) Thanks [@johnie](https://github.com/johnie)! - Fix array items in `extract` function.

## 3.0.1

### Patch Changes

- [#14](https://github.com/johnie/xscrape/pull/14) [`653fecf`](https://github.com/johnie/xscrape/commit/653fecf6b80097bc348c3cc31c2d97cd368e2715) Thanks [@johnie](https://github.com/johnie)! - fix linting

## 3.0.0

### Major Changes

- [#12](https://github.com/johnie/xscrape/pull/12) [`3fbca90`](https://github.com/johnie/xscrape/commit/3fbca90522aae6ef302150a2679aa973e36114fd) Thanks [@johnie](https://github.com/johnie)! - Refactor to use standard schema as validation standard.

## 1.3.1

### Patch Changes

- [#3](https://github.com/johnie/xscrape/pull/3) [`f746a88`](https://github.com/johnie/xscrape/commit/f746a88c1082bf6dafd5a3007f49ee930d243e14) Thanks [@johnie](https://github.com/johnie)! - chore: add changesets automation

## 1.3.0

### Minor Changes

- f3a0ed2: This introduces nested field support for HTML data extraction, enhancing the createScraper function to handle nested structures within the data schema. Additionally, improvements were made to the README for better readability and documentation on these new nested field features.
- 0666f5e: Add support for Effect/Schema validator
