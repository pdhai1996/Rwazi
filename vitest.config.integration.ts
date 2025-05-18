import { defineConfig } from 'vitest/config';
import path from 'path';

const config = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.integration.test.ts',
    ],
    setupFiles: [
      'config.ts'  // Only load the core config
    ],
    globalSetup: ['./tests/setup/global-setup.ts'], // Use only the global setup
    sequence: {
      // setupFiles: 'sequential',
      // hooks: 'sequential',
      // testFiles: 'sequential',
    },
    // Set isolate to false to share global state between tests
    isolate: false,
    // Run tests sequentially in a single thread to avoid race conditions
    // singleThread: true,
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false
      }
    },
    // Longer timeout for integration tests that interact with a database
    testTimeout: 30000
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@prisma': path.resolve(__dirname, './prisma'),
    },
  },
});

export default config;
