import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { authService } from '@src/services/AuthService';
import { userRepo } from '@src/repos/UserRepo';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import app from '@src/server';

describe('AuthService - login', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        password: createHash('sha256').update('password123').digest('hex'),
        createdAt: new Date(),
        updatedAt: new Date()
    };



    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return a token for valid credentials', async () => {
        const findOneSpy = vi.spyOn(userRepo, 'findOne');
        findOneSpy.mockResolvedValueOnce(mockUser);
        
        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';

        const jwtSignSpy  = vi.spyOn(jwt, 'sign');
        jwtSignSpy.mockImplementationOnce(() => mockAccessToken)
          .mockImplementationOnce(() => mockRefreshToken);

        const result = await authService.login('testuser', 'password123');
        
        expect(result).not.toBeNull();
        expect(result).toEqual({
            token: mockAccessToken,
            user: {
                id: mockUser.id,
                username: mockUser.username,
            },
            refreshToken: mockRefreshToken,
            expiresIn: 15 * 60,
            tokenType: 'JWT'
        });
        
    });

    it('should return null for invalid credentials', async () => {
        const findOneSpy = vi.spyOn(userRepo, 'findOne');
        findOneSpy.mockResolvedValueOnce(null);
        const result = await authService.login('testuser', 'wrongpassword');
        expect(userRepo.findOne).toHaveBeenCalled();
        expect(result).toBeNull();
    });
});

describe('POST /login', () => {
    const testUserName = 'testuser';
    const testPassword = 'password123';

    beforeAll(async () => {
        const sampleUser = {
            username: testUserName,
            name: 'Test User',
            password: createHash('sha256').update(testPassword).digest('hex'),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        await userRepo.create(sampleUser);

    });
    afterAll(async () => {
        await userRepo.deleteMany({ username: testUserName });
    });
    it('should validate the request body for missing fields', async () => {
        const invalidBody = {
            username: "testuser"
            // Missing password field
        }
        const response = await supertest(app).post('/api/auth/login').send(invalidBody);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Password is required');
    });
    
    it('should validate the request body for empty fields', async () => {
        const invalidBody = {
            username: "testuser",
            password: "   "  // Empty password after trim
        }
        const response = await supertest(app).post('/api/auth/login').send(invalidBody);
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Password cannot be empty');
    });

    it('should respond with a token for valid credentials', async () => {
        const response = await supertest(app).post('/api/auth/login').send({
            username: testUserName,
            password: testPassword
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('username', testUserName);
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body).toHaveProperty('expiresIn', 15 * 60);
    });

    it('should respond with 401 for invalid credentials', async () => {
        // Mock the auth service login to return null for invalid credentials
        vi.spyOn(authService, 'login').mockResolvedValueOnce(null);
        
        const response = await supertest(app).post('/api/auth/login').send({
            username: 'testuser',
            password: 'wrongpassword'
        });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid username or password');
    });
});