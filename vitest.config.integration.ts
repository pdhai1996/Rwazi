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
      './tests/support/setup.ts'
    ],
    isolate: true,
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@prisma': path.resolve(__dirname, './prisma'),
    },
  },
});

export default config;
