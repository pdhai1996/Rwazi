import resetDb from '../helpers/reset-db';
import prisma from '../../prisma/client';
import { loadTestData, clearTestData } from '../helpers/test-data';
import { resetDataLoadedState } from '../helpers/test-setup';

// Track if setup has already run
let hasSetupRun = false;

// Export a default function that runs once before all tests
export default async function() {
  // Only run setup once
  if (hasSetupRun) {
    console.log('GLOBAL SETUP: Already run, skipping...');
    return;
  }
  
  console.log('GLOBAL SETUP: [START] Setting up test environment at ' + new Date().toISOString());
  
  console.log('GLOBAL SETUP: Resetting database...');
  await resetDb();

  console.log('GLOBAL SETUP: Loading test data...');
  await loadTestData(prisma);
  
  // Set up JWT secret for tests
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  
  // Mark setup as complete
  hasSetupRun = true;
  console.log('GLOBAL SETUP: [COMPLETE] Setup finished at ' + new Date().toISOString());
  
  // Make the test-setup helper aware that data is already loaded
  resetDataLoadedState(true);
  
  // Return a teardown function to clean up after all tests
  return async () => {
    console.log('GLOBAL TEARDOWN: [START] Cleaning up after all tests...');
    await clearTestData(prisma);
    // Reset for the next test run
    hasSetupRun = false;
    resetDataLoadedState(false);
    console.log('GLOBAL TEARDOWN: [COMPLETE] Cleanup finished');
  };
}
