import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import prisma from '../../prisma/client';
import { loadTestData, clearTestData, nycCenter, testPlaces } from '../helpers/test-data';

describe('Place Search API - Integration Tests', () => {
  beforeAll(async () => {
    await loadTestData(prisma);
  });

  afterAll(async () => {
    await clearTestData(prisma);
  });

  it('should return nearby places within 5km radius', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 5 // 5km radius
      });
      console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);

    // Count places that should be within 5km radius
    const expectedPlaces = testPlaces.filter(place => {
      // Simple approximation: places with IDs containing "nearby"
      return place.id.includes('nearby');
    });
    
    expect(response.body.length).toBe(expectedPlaces.length);
    
    // Verify all returned places have distances less than 5000 meters
    response.body.forEach((place: any) => {
      expect(place.distance).toBeLessThanOrEqual(5000);
    });
  });

  it('should filter places by service type', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10, // 10km radius
        serviceId: 1 // Store service type
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);

    // All returned places should be stores
    response.body.forEach((place: any) => {
      expect(place.service_id).toBe(1);
      expect(place.serviceName).toBe('Store');
    });
    
    // Verify we get the expected nearby stores
    const nearbyStores = testPlaces.filter(place => 
      place.service_id === 1 && place.id.includes('nearby')
    );
    expect(response.body.length).toBe(nearbyStores.length);
  });

  it('should filter places by keyword', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 20, // 20km radius
        keyword: 'Coffee'
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);

    // All returned places should have "Coffee" in their name
    response.body.forEach((place: any) => {
      expect(place.name.toLowerCase()).toContain('coffee');
    });
  });

  it('should combine service type and keyword filters', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 20, // 20km radius
        serviceId: 3, // Coffee shops
        keyword: 'Premium'
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    
    const premiumCoffee = response.body[0];
    expect(premiumCoffee.service_id).toBe(3);
    expect(premiumCoffee.serviceName).toBe('Coffee');
    expect(premiumCoffee.name).toContain('Premium');
  });

  it('should return validation error for invalid coordinates', async () => {
    const response = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: 'invalid',
        lng: nycCenter.longitude,
        radius: 5
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should support pagination', async () => {
    // First page (2 items)
    const firstPageResponse = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10,
        page: 1,
        pageSize: 2
      });

    expect(firstPageResponse.status).toBe(200);
    expect(firstPageResponse.body).toBeInstanceOf(Array);
    expect(firstPageResponse.body.length).toBe(2);

    // Second page (should have different items)
    const secondPageResponse = await supertest(app)
      .get('/api/places/search')
      .query({
        lat: nycCenter.latitude,
        lng: nycCenter.longitude,
        radius: 10,
        page: 2,
        pageSize: 2
      });

    expect(secondPageResponse.status).toBe(200);
    expect(secondPageResponse.body).toBeInstanceOf(Array);
    
    // Verify first and second page have different items
    const firstPageIds = firstPageResponse.body.map((p: any) => p.id);
    const secondPageIds = secondPageResponse.body.map((p: any) => p.id);
    
    for (const id of secondPageIds) {
      expect(firstPageIds).not.toContain(id);
    }
  });
});
