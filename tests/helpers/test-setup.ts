import prisma from '../../prisma/client';
import { loadTestData } from './test-data';

/**
 * Shared setup logic for test files
 * This ensures that test data is loaded only once per test run
 * and prevents conflicts between test files
 */
let dataLoaded = false;
let dataLoadPromise: Promise<void> | null = null;
let dataLoadCount = 0;

/**
 * Ensures test data is loaded only once per test run
 * Multiple calls will return the same promise to prevent race conditions
 */
export const ensureTestData = async () => {
  // Increment call counter for debugging
  dataLoadCount++;
  const callNum = dataLoadCount;
  
  if (dataLoaded) {
    console.log(`SETUP HELPER (call #${callNum}): Data already loaded, skipping`);
    return true;
  }
  
  if (!dataLoadPromise) {
    console.log(`SETUP HELPER (call #${callNum}): Starting data load`);
    dataLoadPromise = loadTestData(prisma).then(() => {
      dataLoaded = true;
      console.log(`SETUP HELPER (call #${callNum}): Test data loaded successfully`);
    });
  } else {
    console.log(`SETUP HELPER (call #${callNum}): Reusing existing data load promise`);
  }
  
  await dataLoadPromise;
  return true;
};

/**
 * Reset the data loaded state - useful for testing
 * @param isLoaded Set to true if data has been pre-loaded elsewhere
 */
export const resetDataLoadedState = (isLoaded = false) => {
  console.log(`SETUP HELPER: Resetting data loaded state (isLoaded: ${isLoaded})`);
  dataLoaded = isLoaded;
  dataLoadPromise = null;
  dataLoadCount = 0;
};
