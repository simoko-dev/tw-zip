import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/react/index.ts',
    'src/react/lazy.ts',
    'src/vue/index.ts',
    'src/vue/lazy.ts',
    'src/svelte/index.ts',
    'src/svelte/lazy.ts',
    'src/solidjs/index.ts',
    'src/solidjs/lazy.ts',
    'src/angular/index.ts',
    'src/angular/lazy.ts',
    'src/zip6/index.ts',
    'src/zip6/loader.ts',
  ],
  dts: true,
  treeshake: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  minify: true,
  bundle: true,
  clean: true,
  format: ['cjs', 'esm'],
})
