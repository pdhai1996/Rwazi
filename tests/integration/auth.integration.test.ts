import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import app from '@src/server';
import { ensureTestData } from '../helpers/test-setup';
import { testUser } from '../helpers/test-data';
import { createHash } from 'crypto';

describe('Auth API - Integration Tests', () => {
  let refreshToken: string;

  beforeAll(async () => {
    // This will be a no-op if data is already loaded by global setup
    await ensureTestData();
    console.log('Auth integration tests setup complete');
  });

  it('should login and return tokens', async () => {
    const response = await supertest(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: 'password123' // This matches the hashed password in test-data.ts
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('username');
    expect(response.body).toHaveProperty('expiresIn');
    expect(response.body).toHaveProperty('tokenType');

    // Store refresh token for next test
    refreshToken = response.body.refreshToken;
  });

  it('should refresh token', async () => {
    // Skip if previous test failed
    if (!refreshToken) {
      console.warn('Skipping refresh token test because login test failed');
      return;
    }

    const response = await supertest(app)
      .post('/api/auth/refresh')
      .send({
        refreshToken
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('username');
    expect(response.body).toHaveProperty('expiresIn');
    expect(response.body).toHaveProperty('tokenType');
    
    // Store the new refresh token
    refreshToken = response.body.refreshToken;
  });
  
  it('should reject invalid refresh token', async () => {
    const response = await supertest(app)
      .post('/api/auth/refresh')
      .send({
        refreshToken: 'invalid-token'
      });
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Invalid or expired refresh token');
  });

  it('should validate refresh token request', async () => {
    const response = await supertest(app)
      .post('/api/auth/refresh')
      .send({});
    
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
    expect(response.body.errors[0]).toHaveProperty('path');
    expect(response.body.errors[0].path).toBe('refreshToken');
  });
});
