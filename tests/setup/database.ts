import resetDb from 'tests/helpers/reset-db'
import { beforeAll } from 'vitest'

beforeAll(async () => {
  console.log('Resetting database...');
  await resetDb();
});

// beforeEach(async () => {
//   // await resetDb()
// })