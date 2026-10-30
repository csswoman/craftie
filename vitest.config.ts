import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@lib': fileURLToPath(new URL('./lib', import.meta.url)),
    },
  },
  test: {
    include: ['lib/**/*.test.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['lib/**/*.ts'],
      exclude: ['lib/vendor/**', 'lib/**/*.test.ts', 'lib/**/*.d.ts'],
      thresholds: { statements: 80, lines: 80, functions: 80, branches: 65 },
    },
  },
});
