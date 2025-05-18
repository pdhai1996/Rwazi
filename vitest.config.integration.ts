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
      'config.ts', 
        './tests/setup/database.ts'
    ],
    isolate: true,
    poolOptions: {
      threads: {
        singleThread: true,
      }
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@prisma': path.resolve(__dirname, './prisma'),
    },
  },
});

export default config;
