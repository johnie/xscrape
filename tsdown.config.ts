import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  minify: true,
  report: true,
  publint: true,
  attw: { profile: 'esm-only' },
});
