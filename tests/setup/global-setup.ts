import resetDb from '../helpers/reset-db';

// Export a default function that runs once before all tests
export default async function() {
  console.log('GLOBAL SETUP: Resetting database once before all tests...');
  await resetDb();
  
  // Set up JWT secret for tests
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  
  // You can return a teardown function if needed
  return async () => {
    console.log('GLOBAL TEARDOWN: Cleaning up after all tests...');
    // Add any cleanup if needed
  };
}
