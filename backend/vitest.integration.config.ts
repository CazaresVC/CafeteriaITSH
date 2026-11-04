import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.integration.test.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
