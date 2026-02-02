import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    benchmark: {
      include: ['**/*.bench.ts'],
      reporters: ['default'],
    },
  },
})
