# Installation

```bash
npm install xscrape
# or: pnpm add xscrape
# or: bun add xscrape
```

Install a Standard Schema-compatible validation library separately, such as `zod`, `valibot`, `arktype`, or `effect`.

The package is ESM-only and requires Node.js 22.12 or newer. CI tests Node.js 22 and 24; other runtimes are not currently covered. The package consumes HTML strings, not URLs. It does not launch a browser or run page JavaScript.

```ts
import { defineScraper, text } from "xscrape";
```
