import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entryPoints: ['src/index.ts', 'src/types.ts'],
  clean: true,
  format: ['cjs'],
  dts: true,
  ...options,
}));
