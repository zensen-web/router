import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.js'],
    },
  },
})
