import { describe, expect, it, beforeAll } from 'vitest';
import { placeService } from '@src/services/PlaceService';

describe('Spatial Query Performance', () => {
  let startTime: number;
  let endTime: number;
  
  // Time measurement helper
  const measureTime = async <T>(callback: () => Promise<T>): Promise<[T, number]> => {
    startTime = performance.now();
    const result = await callback();
    endTime = performance.now();
    return [result, endTime - startTime];
  };

  it('should efficiently search for places within a radius', async () => {
    // Test location: New York City area
    const location = { lat: 40.730610, lng: -73.935242 };
    const radius = 5000; // 5km radius
    
    // Perform the search and measure time
    const [result, duration] = await measureTime(() => 
      placeService.searchPlaces(location, radius)
    );
    
    // Log performance information
    console.log(`Spatial query executed in ${duration.toFixed(2)}ms`);
    console.log(`Found ${result.data.length} places within ${radius}m radius`);
    console.log(`Total records: ${result.pagination.totalRecords}`);
    
    // Basic assertions
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.pagination).toBeDefined();
    
    // All results should be within the specified radius
    result.data.forEach(place => {
      expect(place.distance).toBeLessThanOrEqual(radius);
    });
  });
  
  it('should efficiently filter by service type and keyword', async () => {
    // Test location: New York City area
    const location = { lat: 40.730610, lng: -73.935242 };
    const radius = 10000; // 10km radius
    
    // Find a store with "Lakeside" in its name
    const [result, duration] = await measureTime(() => 
      placeService.searchPlaces(location, radius, undefined, 'Lakeside')
    );
    
    console.log(`Filtered query executed in ${duration.toFixed(2)}ms`);
    console.log(`Found ${result.data.length} places matching "Lakeside"`);
    
    // Basic assertions
    expect(result.data.length).toBeGreaterThan(0);
    
    // All results should contain "Lakeside" in their name
    result.data.forEach(place => {
      expect(place.name.toLowerCase()).toContain('lakeside');
      expect(place.distance).toBeLessThanOrEqual(radius);
    });
  });
});
