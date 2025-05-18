import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import { nycCenter, generateTestToken } from '../helpers/test-data';
import { ensureTestData } from '../helpers/test-setup';

describe('Spatial Index Performance - Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // This will be a no-op if data is already loaded by global setup
    await ensureTestData();
    authToken = generateTestToken(); // Generate auth token for all tests
    console.log('Spatial index performance tests setup complete');
  });

  it('should efficiently find places within radius', async () => {
    const startTime = performance.now();
    
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 5000, // 5km radius
      });
      
    const duration = performance.now() - startTime;
    
    // Log performance metrics
    console.log(`Spatial query executed in ${duration.toFixed(2)}ms`);
    console.log(`Found ${response.body.data.length} places within 5km radius`);
    console.log(`Total records: ${response.body.pagination.totalRecords}`);
    
    // Verify the response structure and success
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toBeDefined();
    
    // Verify each place has distance information and is within radius
    if (response.body.data.length > 0) {
      response.body.data.forEach((place: any) => {
        expect(place.distance).toBeDefined();
        expect(place.distance).toBeLessThanOrEqual(5000);
      });
    }
  });
  
  it('should efficiently find places with keyword filter', async () => {
    const startTime = performance.now();
    
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10000, // 10km radius
        keyword: 'Lakeside',
      });
      
    const duration = performance.now() - startTime;
    
    // Log performance metrics
    console.log(`Keyword search executed in ${duration.toFixed(2)}ms`);
    console.log(`Found ${response.body.data.length} places matching "Lakeside"`);
    
    // Verify the response
    expect(response.status).toBe(200);
    
    // Check all results contain the keyword
    if (response.body.data.length > 0) {
      response.body.data.forEach((place: any) => {
        expect(place.name.toLowerCase()).toContain('lakeside');
      });
    }
  });

  it('should efficiently filter by service type', async () => {
    // First get a valid service ID from the API
    const servicesResponse = await supertest(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(servicesResponse.status).toBe(200);
    expect(servicesResponse.body).toBeInstanceOf(Array);
    
    // If we have services, test filtering by the first service
    if (servicesResponse.body.length > 0) {
      const serviceId = servicesResponse.body[0].id;
      const startTime = performance.now();
      
      const response = await supertest(app)
        .get('/api/places/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          lat: nycCenter.latitude,
          lng: nycCenter.longitude,
          radius: 10000, // 10km radius
          serviceId,
        });
        
      const duration = performance.now() - startTime;
      
      // Log performance metrics
      console.log(`Service filter search executed in ${duration.toFixed(2)}ms`);
      console.log(`Found ${response.body.data.length} places with service ID ${serviceId}`);
      
      // Verify the response
      expect(response.status).toBe(200);
      
      // Check all results have the correct service ID
      if (response.body.data.length > 0) {
        response.body.data.forEach((place: any) => {
          expect(place.service_id).toBe(serviceId);
        });
      }
    }
  });
});
