import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'xscrape',
  description:
    'Extract and transform HTML with your own schema, powered by Standard Schema',
  base: '/', // adjust if hosting under subpath
  themeConfig: {
    logo: '/logo.svg', // add your logo in docs/public
    siteTitle: 'xscrape',
    nav: [
      { text: 'Guide', link: '/quick-start' },
      { text: 'API', link: '/api/defineScraper' },
      { text: 'Examples', link: '/examples' },
      { text: 'GitHub', link: 'https://github.com/johnie/xscrape' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Installation', link: '/installation' },
          { text: 'Quick Start', link: '/quick-start' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Basic Extraction', link: '/guide/basic-extraction' },
          { text: 'Handling Missing Data', link: '/guide/missing-data' },
          { text: 'Extracting Arrays', link: '/guide/arrays' },
          { text: 'Nested Objects', link: '/guide/nested-objects' },
          { text: 'Custom Transform', link: '/guide/custom-transform' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'defineScraper()', link: '/api/defineScraper' },
          { text: 'Extract Config', link: '/api/extract-config' },
          { text: 'Types', link: '/api/types' },
        ],
      },
      {
        text: 'Examples',
        items: [{ text: 'Combined Examples', link: '/examples' }],
      },
    ],
  },
});
