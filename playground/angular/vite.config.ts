import { defineConfig } from 'vite'
import angular from '@analogjs/vite-plugin-angular'

export default defineConfig({
  plugins: [
    angular({ jit: true }),
  ],
  base: '/tw-zip/angular/',
  resolve: {
    mainFields: ['module', 'main'],
  },
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    include: ['@angular/compiler'],
  },
})
