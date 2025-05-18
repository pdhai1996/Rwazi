import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import prisma from '../../prisma/client';
import { loadTestData, clearTestData, generateTestToken, testPlaces } from '../helpers/test-data';

describe('Favorite Places API - Integration Tests', () => {
  let authToken: string;
  let testPlaceId: number;

  beforeAll(async () => {
    await loadTestData(prisma);
    // Use the first test place
    testPlaceId = testPlaces[0].id;
  });

  beforeEach(() => {
    // Generate fresh auth token before each test
    authToken = generateTestToken();
  });

  afterAll(async () => {
    await clearTestData(prisma);
  });

  it('should require authentication', async () => {
    // Attempt to add favorite without auth token
    const response = await supertest(app)
      .post('/api/favorites/add')
      .send({ placeId: testPlaceId });
      
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should validate place ID when adding to favorites', async () => {
    // Invalid place ID (non-numeric)
    const invalidResponse = await supertest(app)
      .post('/api/favorites/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ placeId: 'abc' });
    
    expect(invalidResponse.status).toBe(422);
    expect(invalidResponse.body.errors).toBeInstanceOf(Array);
    expect(invalidResponse.body.errors.some((e: any) => e.path === 'placeId')).toBe(true);
  });

  it('should add a place to favorites', async () => {
    const response = await supertest(app)
      .post('/api/favorites/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ placeId: testPlaceId });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('favorite');
    expect(response.body.favorite.place_id).toBe(testPlaceId);
  });

  it('should retrieve user favorites', async () => {
    // First add a place to favorites
    await supertest(app)
      .post('/api/favorites/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ placeId: testPlaceId });
    
    // Then retrieve favorites
    const response = await supertest(app)
      .get('/api/favorites/all')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('favorites');
    expect(response.body.favorites).toBeInstanceOf(Array);
    expect(response.body.favorites.length).toBeGreaterThan(0);
    
    // Check the first favorite (which we just added)
    const firstFavorite = response.body.favorites[0];
    expect(firstFavorite).toHaveProperty('place');
    expect(firstFavorite.place.id).toBe(testPlaceId);
  });

  it('should remove a place from favorites', async () => {
    // First add a place to favorites
    const addResponse = await supertest(app)
      .post('/api/favorites/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ placeId: testPlaceId });
    
    const favoriteId = addResponse.body.favorite.id;
    
    // Then remove it
    const removeResponse = await supertest(app)
      .delete(`/api/favorites/${favoriteId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body).toHaveProperty('message');
    expect(removeResponse.body.message).toBe('Favorite removed successfully');
    
    // Verify it's removed by getting all favorites
    const listResponse = await supertest(app)
      .get('/api/favorites/all')
      .set('Authorization', `Bearer ${authToken}`);
    
    // Make sure the removed favorite is not in the list
    const favorites = listResponse.body.favorites;
    const favIds = favorites.map((f: any) => f.id);
    expect(favIds).not.toContain(favoriteId);
  });

  it('should return 404 when removing non-existent favorite', async () => {
    const nonExistentId = 99999;
    
    const response = await supertest(app)
      .delete(`/api/favorites/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(404);
  });
  
  it('should check if a place is favorited', async () => {
    // First add a place to favorites
    await supertest(app)
      .post('/api/favorites/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ placeId: testPlaceId });
    
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
