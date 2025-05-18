import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import prisma from '../../prisma/client';
import { nycCenter, testPlaces, generateTestToken } from '../helpers/test-data';
import { ensureTestData } from '../helpers/test-setup';

describe('Place Search API - Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // This will be a no-op if data is already loaded by global setup
    await ensureTestData();
    console.log('Place integration tests setup complete');
  });

  beforeEach(() => {
    // Generate fresh auth token before each test
    authToken = generateTestToken();
  });

  it('should require authentication', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 5,
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should validate required latitude and longitude parameters', async () => {
    // Missing latitude
    const missingLat = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lng: nycCenter.longitude,
        radius: 5,
      });
    expect(missingLat.status).toBe(422);
    expect(missingLat.body.errors).toBeInstanceOf(Array);
    expect(missingLat.body.errors.some((e: any) => e.path === 'lat')).toBe(true);
    
    // Missing longitude
    const missingLng = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        radius: 5,
      });
    expect(missingLng.status).toBe(422);
    expect(missingLng.body.errors).toBeInstanceOf(Array);
    expect(missingLng.body.errors.some((e: any) => e.path === 'lng')).toBe(true);
  });
  
  it('should validate required radius parameter', async () => {
    // Missing radius
    const missingRadius = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
      });
    expect(missingRadius.status).toBe(422);
    expect(missingRadius.body.errors).toBeInstanceOf(Array);
    expect(missingRadius.body.errors.some((e: any) => e.path === 'radius')).toBe(true);
  });

  it('should validate latitude and longitude ranges', async () => {
    // Invalid latitude (out of range)
    const invalidLat = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: 100, // Out of range
        lng: nycCenter.longitude,
        radius: 5,
      });
    expect(invalidLat.status).toBe(422);
    
    // Invalid longitude (out of range)
    const invalidLng = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: 200, // Out of range
        radius: 5,
      });
    expect(invalidLng.status).toBe(422);
  });

  it('should validate optional parameters', async () => {
    // Negative radius
    const negativeRadius = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: -5,
      });
    expect(negativeRadius.status).toBe(422);
    
    // Invalid page number
    const invalidPage = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 5,
        page: 0,
      });
    expect(invalidPage.status).toBe(422);
    
    // Invalid pageSize
    const invalidPageSize = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 5,
        pageSize: 0,
      });
    expect(invalidPageSize.status).toBe(422);
  });

  it('should return nearby places within 5km radius', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 5, // 5km radius
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body).toHaveProperty('pagination');

    // Count places that should be within 5km radius
    // In our test data, places with IDs 1, 2, 4, 5, 7, 8, 9 are within 5km of NYC center
    const nearbyPlaceIds = [1, 2, 4, 5, 7, 8, 9]; // IDs of places within 5km
    const expectedPlaces = testPlaces.filter(place => nearbyPlaceIds.includes(place.id));
    
    expect(response.body.data.length).toBe(expectedPlaces.length);
    
    // Verify all returned places have distances less than 5000 meters
    response.body.data.forEach((place: any) => {
      expect(place.distance).toBeLessThanOrEqual(5000);
    });
    
    // Verify pagination information
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('pageSize');
    expect(response.body.pagination).toHaveProperty('totalRecords');
    expect(response.body.pagination).toHaveProperty('totalPages');
    expect(response.body.pagination).toHaveProperty('hasNextPage');
    expect(response.body.pagination).toHaveProperty('hasPreviousPage');
    
    // Check that total records matches the expected nearby places count
    expect(response.body.pagination.totalRecords).toBe(expectedPlaces.length);
  });

  it('should filter places by service type', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10, // 10km radius
        serviceId: 1, // Store service type
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);

    // All returned places should be stores
    response.body.data.forEach((place: any) => {
      expect(place.service_id).toBe(1);
      expect(place.serviceName).toBe('Store');
    });
  });

  it('should filter places by keyword', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 20, // 20km radius
        keyword: 'Coffee',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);

    // All returned places should have "Coffee" in their name
    response.body.data.forEach((place: any) => {
      expect(place.name.toLowerCase()).toContain('coffee');
    });
  });

  it('should combine service type and keyword filters', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 20, // 20km radius
        serviceId: 3, // Coffee shops
        keyword: 'Premium',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    
    // In our test data, we have one coffee shop with "Premium" in its name
    // with ID 9 (Premium Coffee House)
    if (response.body.data.length > 0) {
      const premiumCoffee = response.body.data[0];
      expect(premiumCoffee.service_id).toBe(3);
      expect(premiumCoffee.serviceName).toBe('Coffee');
      expect(premiumCoffee.name).toContain('Premium');
    }
  });

  it('should return validation error for invalid coordinates', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: 'invalid',
        lng: nycCenter.longitude,
        radius: 5,
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should support pagination', async () => {
    // First page (2 items)
    const firstPageResponse = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10,
        page: 1,
        pageSize: 2,
      });

    expect(firstPageResponse.status).toBe(200);
    expect(firstPageResponse.body).toHaveProperty('data');
    expect(firstPageResponse.body.data).toBeInstanceOf(Array);
    expect(firstPageResponse.body.data.length).toBe(2);
    
    // Check pagination metadata for first page
    expect(firstPageResponse.body.pagination.page).toBe(1);
    expect(firstPageResponse.body.pagination.pageSize).toBe(2);
    expect(firstPageResponse.body.pagination.totalPages).toBeGreaterThan(1); // Should have more than 1 page

    // Second page (should have different items)
    const secondPageResponse = await supertest(app)
      .get('/api/places/search')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10,
        page: 2,
        pageSize: 2,
      });

    expect(secondPageResponse.status).toBe(200);
    expect(secondPageResponse.body).toHaveProperty('data');
    expect(secondPageResponse.body.data).toBeInstanceOf(Array);
    // Check pagination metadata for second page
    expect(secondPageResponse.body.pagination.page).toBe(2);
    
    if (secondPageResponse.body.data.length > 0) {
      // Verify first and second page have different items
      const firstPageIds = firstPageResponse.body.data.map((p: any) => p.id);
      const secondPageIds = secondPageResponse.body.data.map((p: any) => p.id);
      
      for (const id of secondPageIds) {
        expect(firstPageIds).not.toContain(id);
      }
    }
  });

});
