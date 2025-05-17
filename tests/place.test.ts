import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { placeService } from '@src/services/PlaceService';
import prisma from '@prisma/client';
import supertest from 'supertest';
import app from '@src/server';
import { loadTestData, clearTestData } from './helpers/test-data';

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
        mockQueryRaw.mockImplementation(() => Promise.resolve([]) as any);
        
        await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, 2);
        
        // Check that service_id filter was included in the query
        expect(mockQueryRaw).toHaveBeenCalled();
        const callArgs = mockQueryRaw.mock.calls[0];
        expect(callArgs[0]).toContain('service_id = ?');
        expect(callArgs).toContain(2); // Service ID parameter
    });
    
    it('should include keyword filter when keyword is provided', async () => {
        const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
        mockQueryRaw.mockImplementation(() => Promise.resolve([]) as any);
        
        await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, undefined, 'hotel');
        
        // Check that keyword filter was included in the query
        expect(mockQueryRaw).toHaveBeenCalled();
        const callArgs = mockQueryRaw.mock.calls[0];
        expect(callArgs[0]).toContain('name LIKE ?');
        expect(callArgs).toContain('%hotel%'); // Keyword parameter
    });
    
    it('should combine filters when all parameters are provided', async () => {
        const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
        mockQueryRaw.mockImplementation(() => Promise.resolve([]) as any);
        
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
    beforeAll(async () => {
        // Load test data into the database
        await loadTestData(prisma);
    });
    
    afterAll(async () => {
        // Clean up test data after tests
        await clearTestData(prisma);
    });
    
    // Use actual service implementation instead of mocks for integration tests
    beforeEach(() => {
        // Restore any mocks to use real implementation
        vi.restoreAllMocks();
    });
    
    afterEach(() => {
        // Cleanup after each test if needed
    });
    
    it('should return 422 if lat/lng parameters are missing', async () => {
        const response = await supertest(app)
            .get('/api/places/search')
            .query({ radius: 1000 });
        
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
    });
    
    it('should return 422 if lat/lng parameters are invalid', async () => {
        const response = await supertest(app)
            .get('/api/places/search')
            .query({ lat: 'invalid', lng: 'invalid', radius: 1000 });
        
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
    });
    
    // it('should return 200 with places when valid parameters are provided', async () => {
    //     // Search in 5km radius from NYC center
    //     const response = await supertest(app)
    //         .get('/api/places/search')
    //         .query({ 
    //             lat: nycCenter.latitude, 
    //             lng: nycCenter.longitude, 
    //             radius: 5 // 5km radius
    //         });
        
    //     // Print response body for debugging
    //     console.log("Response status:", response.status);
    //     console.log("Response body:", JSON.stringify(response.body, null, 2));
        
    //     expect(response.status).toBe(200);
    //     expect(Array.isArray(response.body)).toBe(true);
        
    //     // Should include all nearby places (within 5km)
    //     expect(response.body.length).toBeGreaterThanOrEqual(6); // 6 nearby places in test data
        
    //     // First result should be closest to the center and have proper structure
    //     expect(response.body[0]).toHaveProperty('id');
    //     expect(response.body[0]).toHaveProperty('name');
    //     expect(response.body[0]).toHaveProperty('distance');
    //     expect(response.body[0]).toHaveProperty('serviceName');
        
    //     // Results should be sorted by distance
    //     for (let i = 1; i < response.body.length; i++) {
    //         expect(response.body[i-1].distance).toBeLessThanOrEqual(response.body[i].distance);
    //     }
    // });
    
    // it('should filter by service type', async () => {
    //     // Search for stores (service_id: 1) within 5km
    //     const response = await supertest(app)
    //         .get('/api/places/search')
    //         .query({ 
    //             lat: nycCenter.latitude, 
    //             lng: nycCenter.longitude, 
    //             radius: 5,    // 5km radius
    //             serviceId: 1  // Stores only
    //         });
        
    //     expect(response.status).toBe(200);
    //     expect(Array.isArray(response.body)).toBe(true);
        
    //     // All results should be stores
    //     response.body.forEach((place: any) => {
    //         expect(place.service_id).toBe(1);
    //         expect(place.serviceName).toBe('Store');
    //     });
        
    //     // Should include the 2 nearby stores (within 5km)
    //     expect(response.body.length).toBe(2);
        
    //     // Should include 'Downtown Grocery' and 'City Mart'
    //     const placeNames = response.body.map((place: any) => place.name);
    //     expect(placeNames).toContain('Downtown Grocery');
    //     expect(placeNames).toContain('City Mart');
    // });
    
    // it('should filter by keyword', async () => {
    //     // Search for places with "Coffee" in the name
    //     const response = await supertest(app)
    //         .get('/api/places/search')
    //         .query({ 
    //             lat: nycCenter.latitude, 
    //             lng: nycCenter.longitude, 
    //             radius: 10,     // 10km radius to include more results
    //             keyword: 'Coffee' 
    //         });
        
    //     expect(response.status).toBe(200);
    //     expect(Array.isArray(response.body)).toBe(true);
        
    //     // All results should contain "Coffee" in the name
    //     response.body.forEach((place: any) => {
    //         expect(place.name.toLowerCase()).toContain('coffee');
    //     });
        
    //     // Should include 'Premium Coffee House'
    //     const placeNames = response.body.map((place: any) => place.name);
    //     expect(placeNames).toContain('Premium Coffee House');
    // });
    
    // it('should combine filters - service type and radius', async () => {
    //     // Search for gas stations within 1km
    //     const response = await supertest(app)
    //         .get('/api/places/search')
    //         .query({ 
    //             lat: nycCenter.latitude, 
    //             lng: nycCenter.longitude, 
    //             radius: 1,    // 1km radius (tight radius)
    //             serviceId: 2  // Gas stations only
    //         });
        
    //     expect(response.status).toBe(200);
    //     expect(Array.isArray(response.body)).toBe(true);
        
    //     // Should only include 'Quick Fill Gas' (the only gas station within 1km)
    //     expect(response.body.length).toBe(1);
    //     expect(response.body[0].name).toBe('Quick Fill Gas');
    //     expect(response.body[0].service_id).toBe(2);
    // });
    
    // it('should support pagination', async () => {
    //     // Get first page with 2 results per page
    //     const response1 = await supertest(app)
    //         .get('/api/places/search')
    //         .query({ 
    //             lat: nycCenter.latitude, 
    //             lng: nycCenter.longitude, 
    //             radius: 5,  // 5km radius
    //             page: 1,
    //             pageSize: 2
    //         });
        
    //     expect(response1.status).toBe(200);
    //     expect(response1.body.length).toBe(2);
        
    //     // Get second page with same settings
    //     const response2 = await supertest(app)
    //         .get('/api/places/search')
    //         .query({ 
    //             lat: nycCenter.latitude, 
    //             lng: nycCenter.longitude, 
    //             radius: 5,
    //             page: 2,
    //             pageSize: 2
    //         });
        
    //     expect(response2.status).toBe(200);
    //     expect(response2.body.length).toBe(2);
        
    //     // First and second page should have different results
    //     expect(response1.body[0].id).not.toBe(response2.body[0].id);
    //     expect(response1.body[1].id).not.toBe(response2.body[1].id);
    // });
});
