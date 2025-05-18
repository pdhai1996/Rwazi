
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('───────────────────────────────────────────');
console.log('🧪 Running integration tests');
console.log('───────────────────────────────────────────');
console.log('Start time:', new Date().toISOString());
console.log();

try {
  // Run integration tests with the proper configuration
  execSync('npx vitest run --config ./vitest.config.integration.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITEST_LOG_LEVEL: 'info',
    },
  });
  
  console.log();
  console.log('✅ Integration tests completed successfully');
  console.log('End time:', new Date().toISOString());
  console.log('───────────────────────────────────────────');
} catch (error) {
  console.error();
  console.error('❌ Integration tests failed:', error);
  console.error('End time:', new Date().toISOString());
  console.error('───────────────────────────────────────────');
  process.exit(1);
}