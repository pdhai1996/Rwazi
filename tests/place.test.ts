import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { placeService } from '@src/services/PlaceService';
import prisma from '@prisma/client';
import supertest from 'supertest';
import app from '@src/server';

describe('PlaceService - searchPlaces', () => {
    it('should search places by location and radius', async () => {
        // Mock the query raw function
        const mockResults = [
            {
                id: 'test-id-1',
                name: 'Test Place 1',
                service_id: 1,
                longitude: -74.0,
                latitude: 40.7,
                distance: 100,
                serviceName: 'Hotels'
            },
            {
                id: 'test-id-2',
                name: 'Test Place 2',
                service_id: 2,
                longitude: -74.01,
                latitude: 40.71,
                distance: 200,
                serviceName: 'Restaurants'
            }
        ];
        
        const queryRawSpy = vi.spyOn(prisma, '$queryRawUnsafe');
        queryRawSpy.mockResolvedValueOnce(mockResults);
        
        const location = { lat: 40.7, lng: -74.0 };
        const radius = 1000; // 1km
        
        const results = await placeService.searchPlaces(location, radius);
        
        expect(queryRawSpy).toHaveBeenCalled();
        expect(results).toEqual(mockResults);
        expect(results.length).toBe(2);
        expect(results[0].distance).toBeLessThan(results[1].distance);
    });
    
    it('should include service filter when serviceId is provided', async () => {
        const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
        mockQueryRaw.mockImplementation(() => Promise.resolve([]));
        
        await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, 2);
        
        // Check that service_id filter was included in the query
        expect(mockQueryRaw).toHaveBeenCalled();
        const callArgs = mockQueryRaw.mock.calls[0];
        expect(callArgs[0]).toContain('service_id = ?');
        expect(callArgs).toContain(2); // Service ID parameter
    });
    
    it('should include keyword filter when keyword is provided', async () => {
        const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
        mockQueryRaw.mockImplementation(() => Promise.resolve([]));
        
        await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, undefined, 'hotel');
        
        // Check that keyword filter was included in the query
        expect(mockQueryRaw).toHaveBeenCalled();
        const callArgs = mockQueryRaw.mock.calls[0];
        expect(callArgs[0]).toContain('name LIKE ?');
        expect(callArgs).toContain('%hotel%'); // Keyword parameter
    });
    
    it('should combine filters when all parameters are provided', async () => {
        const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
        mockQueryRaw.mockImplementation(() => Promise.resolve([]));
        
        await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, 1, 'luxury');
        
        // Check that both filters were included in the query
        expect(mockQueryRaw).toHaveBeenCalled();
        const callArgs = mockQueryRaw.mock.calls[0];
        expect(callArgs[0]).toContain('service_id = ?');
        expect(callArgs[0]).toContain('name LIKE ?');
        expect(callArgs).toContain(1); // Service ID parameter
        expect(callArgs).toContain('%luxury%'); // Keyword parameter
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });
});

describe('GET /places/search API', () => {
    beforeEach(() => {
        // Mock the searchPlaces service method
        vi.spyOn(placeService, 'searchPlaces').mockImplementation(async () => {
            return [
                {
                    id: 'test-id-1',
                    name: 'Test Place 1',
                    service_id: 1,
                    longitude: -74.0,
                    latitude: 40.7,
                    distance: 100,
                    serviceName: 'Hotels'
                },
                {
                    id: 'test-id-2',
                    name: 'Test Place 2',
                    service_id: 2,
                    longitude: -74.01,
                    latitude: 40.71,
                    distance: 200,
                    serviceName: 'Restaurants'
                }
            ];
        });
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });
    
    it('should return 422 if lat/lng parameters are missing', async () => {
        const response = await supertest(app)
            .get('/api/places/search')
            .query({ radius: 1000 });
        
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.message).toBe('Validation error');
    });
    
    it('should return 422 if lat/lng parameters are invalid', async () => {
        const response = await supertest(app)
            .get('/api/places/search')
            .query({ lat: 'invalid', lng: 'invalid', radius: 1000 });
        
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
    });
    
    it('should return 200 with places when valid parameters are provided', async () => {
        const response = await supertest(app)
            .get('/api/places/search')
            .query({ lat: 40.7, lng: -74.0, radius: 1000 });
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('id', 'test-id-1');
        expect(response.body[0]).toHaveProperty('name', 'Test Place 1');
        expect(response.body[0]).toHaveProperty('distance', 100);
    });
    
    it('should accept and apply service filter', async () => {
        await supertest(app)
            .get('/api/places/search')
            .query({ lat: 40.7, lng: -74.0, radius: 1000, serviceId: 2 });
        
        expect(placeService.searchPlaces).toHaveBeenCalledWith(
            { lat: 40.7, lng: -74.0 },
            1000000,  // 1000km in meters
            2,        // serviceId
            undefined, // keyword
            undefined, // page
            undefined  // pageSize
        );
    });
    
    it('should accept and apply keyword filter', async () => {
        await supertest(app)
            .get('/api/places/search')
            .query({ lat: 40.7, lng: -74.0, radius: 1000, keyword: 'hotel' });
        
        expect(placeService.searchPlaces).toHaveBeenCalledWith(
            { lat: 40.7, lng: -74.0 },
            1000000,  // 1000km in meters
            undefined, // serviceId
            'hotel',  // keyword
            undefined, // page
            undefined  // pageSize
        );
    });
});
