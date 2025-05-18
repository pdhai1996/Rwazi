import resetDb from '../helpers/reset-db';

// Export a default function that runs once before all tests
export default async function() {
  console.log('GLOBAL SETUP: Resetting database once before all tests...');
  await resetDb();
  
  // You can return a teardown function if needed
  return async () => {
    console.log('GLOBAL TEARDOWN: Cleaning up after all tests...');
    // Add any cleanup if needed
  };
}
