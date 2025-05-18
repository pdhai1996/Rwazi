import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import prisma from '../../src/common/prisma';
import { generateTestToken, testPlaces } from '../helpers/test-data';
import { ensureTestData } from '../helpers/test-setup';

describe('Favorite Places API - Integration Tests', () => {
  let authToken: string;
  let testPlaceId: number;

  beforeAll(async () => {
    // This will be a no-op if data is already loaded by global setup
    await ensureTestData();
    // Use the first test place
    testPlaceId = testPlaces[0].id;
  });

  beforeEach(() => {
    // Generate fresh auth token before each test
    authToken = generateTestToken();
  });

  describe('POST /api/favorites - Add to Favorites', () => {
    it('should require authentication', async () => {
      // Attempt to add favorite without auth token
      const response = await supertest(app)
        .post('/api/favorites')
        .send({ place_id: testPlaceId });
        
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });

    it('should validate place ID when adding to favorites', async () => {
      // Invalid place ID (non-numeric)
      const invalidResponse = await supertest(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ place_id: 'abc' });
      
      expect(invalidResponse.status).toBe(422);
      expect(invalidResponse.body.errors).toBeInstanceOf(Array);
      expect(invalidResponse.body.errors.some((e: any) => e.path === 'place_id')).toBe(true);
    });

    it('should add a place to favorites', async () => {
      const response = await supertest(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ place_id: testPlaceId });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('favorite');
      expect(response.body.favorite.place_id).toBe(testPlaceId);
    });
  });

  describe('GET /api/favorites - Retrieve Favorites', () => {
    it('should require authentication to retrieve favorites', async () => {
      const response = await supertest(app)
        .get('/api/favorites');
        
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });
    
    it('should retrieve user favorites', async () => {
      // First add a place to favorites
      await supertest(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ place_id: testPlaceId });
      
      // Then retrieve favorites
      const response = await supertest(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check the first favorite (which we just added)
      const firstFavorite = response.body.data[0];
      expect(firstFavorite).toHaveProperty('place');
      expect(firstFavorite.place.id).toBe(testPlaceId);
    });
    
    it('should support pagination when retrieving favorites', async () => {
      // Add multiple places to favorites to test pagination
      const testPlaceIds = [testPlaces[0].id, testPlaces[1].id, testPlaces[2].id];
      
      for (const placeId of testPlaceIds) {
        await supertest(app)
          .post('/api/favorites')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ place_id: placeId });
      }
      
      // Test pagination with page size = 2
      const paginatedResponse = await supertest(app)
        .get('/api/favorites')
        .query({ page: 1, pageSize: 2 })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(paginatedResponse.status).toBe(200);
      expect(paginatedResponse.body).toHaveProperty('data');
      expect(paginatedResponse.body).toHaveProperty('pagination');
      expect(paginatedResponse.body.data.length).toBeLessThanOrEqual(2);
      expect(paginatedResponse.body.pagination).toHaveProperty('page', 1);
      expect(paginatedResponse.body.pagination).toHaveProperty('pageSize', 2);
      expect(paginatedResponse.body.pagination).toHaveProperty('totalRecords');
      expect(paginatedResponse.body.pagination).toHaveProperty('totalPages');
      expect(paginatedResponse.body.pagination).toHaveProperty('hasNextPage');
      expect(paginatedResponse.body.pagination).toHaveProperty('hasPreviousPage');
    });
    
    
    it('should check if a place is favorited', async () => {
      // First add a place to favorites
      await supertest(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ place_id: testPlaceId });
      
      // Then check if it's favorited
      const checkResponse = await supertest(app)
        .get(`/api/favorites/check/${testPlaceId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(checkResponse.status).toBe(200);
      expect(checkResponse.body).toHaveProperty('isFavorited');
      expect(checkResponse.body.isFavorited).toBe(true);
      
      // Check a place that isn't favorited
      const nonFavoritedPlaceId = testPlaces[5].id; // Use a different test place
      const checkNonFavoritedResponse = await supertest(app)
        .get(`/api/favorites/check/${nonFavoritedPlaceId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(checkNonFavoritedResponse.status).toBe(200);
      expect(checkNonFavoritedResponse.body).toHaveProperty('isFavorited');
      expect(checkNonFavoritedResponse.body.isFavorited).toBe(false);
    });
  });
  
});
