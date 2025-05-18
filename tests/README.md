# Integration Testing Guide

## Overview

This project uses Vitest for integration tests that interact with a real database. The tests are designed to run sequentially to avoid data conflicts and race conditions.

## Test Setup

The integration tests use a shared test data setup approach to ensure that:

1. Test data is loaded only once per test suite
2. Test data is properly cleaned up after all tests complete
3. Tests don't interfere with each other by using different data sets

## Running Integration Tests

To run all integration tests:

```bash
npm run test:integration
```

To run integration tests in watch mode:

```bash
npm run test:integration:watch
```

To run a specific integration test file:

```bash
npm run test:integration -- favorite.integration.test.ts
```

## Test Data Management

Test data is managed centrally through the `test-data.ts` helper, which is responsible for:

- Defining test data constants (users, places, services)
- Loading data into the database
- Cleaning up data after tests complete

The `test-setup.ts` helper ensures that data is loaded only once, even when multiple test files need it.

## Troubleshooting

If you encounter issues with test data, you can reset the test database using:

```bash
npm run migrate:test
```

Then run the integration tests again.
