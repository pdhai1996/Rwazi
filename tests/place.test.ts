import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { placeService } from '@src/services/PlaceService';
import prisma from '@src/common/prisma';

describe('PlaceService - searchPlaces', () => {
  it('should search places by location and radius', async () => {
    // Mock the query raw function
    const mockResults = [
      {
        id: 1,
        name: 'Test Place 1',
        service_id: 1,
        longitude: -74.0,
        latitude: 40.7,
        distance: 100,
        serviceName: 'Hotels',
      },
      {
        id:1,
        name: 'Test Place 2',
        service_id: 2,
        longitude: -74.01,
        latitude: 40.71,
        distance: 200,
        serviceName: 'Restaurants',
      },
    ];

    // Mock the count query first (for pagination)
    const mockCountResult = [{ total: BigInt(2) }];
    const queryRawSpy = vi.spyOn(prisma, '$queryRawUnsafe');
    queryRawSpy.mockResolvedValueOnce(mockCountResult).mockResolvedValueOnce(mockResults);
        
    const location = { lat: 40.7, lng: -74.0 };
    const radius = 1; // 1km
        
    const results = await placeService.searchPlaces(location, radius);
        
    expect(queryRawSpy).toHaveBeenCalled();
    expect(results.data).toEqual(mockResults);
    expect(results.data.length).toBe(2);
    expect(results.data[0].distance).toBeLessThan(results.data[1].distance);
    expect(results.pagination).toEqual({
      page: 1,
      pageSize: 20,
      totalRecords: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
    
  it('should include service filter when serviceId is provided', async () => {
    const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
    // Mock both the count query and the data query
    mockQueryRaw.mockResolvedValueOnce([{ total: BigInt(0) }]).mockResolvedValueOnce([]);
        
    await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, 2);
        
    // Check that service_id filter was included in the query
    expect(mockQueryRaw).toHaveBeenCalledTimes(2); // Count query and data query
    const countQueryArgs = mockQueryRaw.mock.calls[0];
    expect(countQueryArgs[0]).toContain('service_id = ?');
    expect(countQueryArgs).toContain(2); // Service ID parameter
  });
    
  it('should include keyword filter when keyword is provided', async () => {
    const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
    // Mock both the count query and the data query
    mockQueryRaw.mockResolvedValueOnce([{ total: BigInt(0) }]).mockResolvedValueOnce([]);
        
    await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, undefined, 'hotel');
        
    // Check that keyword filter was included in the query
    expect(mockQueryRaw).toHaveBeenCalledTimes(2); // Count query and data query
    const countQueryArgs = mockQueryRaw.mock.calls[0];
    expect(countQueryArgs[0]).toContain('p.name LIKE ?');
    expect(countQueryArgs).toContain('%hotel%'); // Keyword parameter
  });
    
  it('should combine filters when all parameters are provided', async () => {
    const mockQueryRaw = vi.spyOn(prisma, '$queryRawUnsafe');
    // Mock both the count query and the data query
    mockQueryRaw.mockResolvedValueOnce([{ total: BigInt(0) }]).mockResolvedValueOnce([]);
        
    await placeService.searchPlaces({ lat: 40.7, lng: -74.0 }, 1000, 1, 'luxury');
        
    // Check that both filters were included in the query
    expect(mockQueryRaw).toHaveBeenCalledTimes(2); // Count query and data query
    const countQueryArgs = mockQueryRaw.mock.calls[0];
    expect(countQueryArgs[0]).toContain('service_id = ?');
    expect(countQueryArgs[0]).toContain('p.name LIKE ?');
    expect(countQueryArgs).toContain(1); // Service ID parameter
    expect(countQueryArgs).toContain('%luxury%'); // Keyword parameter
  });
    
  afterEach(() => {
    vi.restoreAllMocks();
  });
});
