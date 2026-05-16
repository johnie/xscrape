---
'xscrape': major
---

Drop CJS build. The package now ships ESM only.

Migration: import via `import { defineScraper } from 'xscrape'`. Consumers using `require('xscrape')` must migrate to ESM (Node 18+ supports ESM natively).
