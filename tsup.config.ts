import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts', 'src/vue/index.ts'],
  dts: true,
  treeshake: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  minify: true,
  bundle: true,
  clean: true,
  format: ['cjs', 'esm', 'iife'],
})
