import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import prisma from '../../src/common/prisma';
import { testServices, generateTestToken } from '../helpers/test-data';
import { ensureTestData } from '../helpers/test-setup';

describe('Services API - Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // This will be a no-op if data is already loaded by global setup
    await ensureTestData();
    console.log('Service integration tests setup complete');
  });

  beforeEach(() => {
    // Generate fresh auth token before each test
    authToken = generateTestToken();
  });

  it('should require authentication', async () => {
    const response = await supertest(app)
      .get('/api/services');
    
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return all services when authenticated', async () => {
    const response = await supertest(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Check that all test services are present in the response
    const services = response.body.data;
    expect(services.length).toBeGreaterThanOrEqual(testServices.length);
    
    // Check that all test services are in the returned data
    testServices.forEach(testService => {
      const foundService = services.find((s: any) => s.id === testService.id);
      expect(foundService).toBeDefined();
      expect(foundService.name).toBe(testService.name);
      expect(foundService.slug).toBe(testService.slug);
    });
  });

  it('should return services with the correct structure', async () => {
    const response = await supertest(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    
    // Check the first service has the expected structure
    const services = response.body.data;
    expect(services.length).toBeGreaterThan(0);
    
    const firstService = services[0];
    expect(firstService).toHaveProperty('id');
    expect(firstService).toHaveProperty('name');
    expect(firstService).toHaveProperty('slug');
    
    // Type validation
    expect(typeof firstService.id).toBe('number');
    expect(typeof firstService.name).toBe('string');
    expect(typeof firstService.slug).toBe('string');
  });
});
