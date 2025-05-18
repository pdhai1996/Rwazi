import { defineConfig } from 'vitest/config';
import path from 'path';

const config = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
    ],
    setupFiles: [
      'config.ts',
      // Removed database.ts from here since we're using globalSetup
    ],
    // Global setup runs once before ALL test files
    globalSetup: './tests/setup/global-setup.ts',
    sequence: {
      shuffle: false,
    },
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@prisma': path.resolve(__dirname, './prisma'),
    },
  },
});

export default config;
