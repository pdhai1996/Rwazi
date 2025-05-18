import { placeRepo } from "@src/repos/PlaceRepo";
import prisma from '../../prisma/client';

interface LocationInterface {
    lat: number;
    lng: number;
}

interface SearchPlacesResult {
    id: number;
    name: string;
    service_id: number;
    longitude: number;
    latitude: number;
    distance: number; // distance in meters from the search point
    serviceName?: string;
}

class PlaceService {
    /**
     * Search for places based on location, radius, service type, and keywords
     * @param location - The center point coordinates (latitude and longitude)
     * @param radius - Search radius in meters
     * @param serviceId - Optional service ID filter
     * @param keyword - Optional keyword search string
     * @param page - Optional page number for pagination
     * @param pageSize - Optional page size for pagination
     * @returns Array of places matching the search criteria, with distance from center point
     */
    async searchPlaces(
        location: LocationInterface,
        radius: number, // in meters
        serviceId?: number,
        keyword?: string,
        page?: number,
        pageSize?: number
    ): Promise<SearchPlacesResult[]> {
        // Build the base query parameters
        const params: any[] = [
            location.lng,
            location.lat,
            location.lng, 
            location.lat,
            radius
        ];

        // Start building the WHERE clause
        let whereClauses = ["ST_Distance_Sphere(location, POINT(?, ?)) <= ?"];
        
        // Add service filter if provided
        if (serviceId !== undefined) {
            whereClauses.push("service_id = ?");
            params.push(serviceId);
        }
        
        // Add keyword search if provided
        if (keyword && keyword.trim().length > 0) {
            whereClauses.push("p.name LIKE ?");
            params.push(`%${keyword.trim()}%`);
        }
        
        // Combine WHERE clauses
        const whereClause = whereClauses.join(" AND ");
        
        // Execute raw SQL query for spatial search
        // Set default values for pagination
        const currentPage = page && page > 0 ? page : 1;
        const size = pageSize && pageSize > 0 ? pageSize : 20;
        const offset = (currentPage - 1) * size;

        const results = await prisma.$queryRawUnsafe<SearchPlacesResult[]>(`
            SELECT 
            p.id,
            p.name,
            p.service_id,
            ST_Distance_Sphere(p.location, POINT(?, ?)) as distance,
            s.name as serviceName
            FROM Place p
            JOIN Service s ON p.service_id = s.id
            WHERE ${whereClause}
            ORDER BY distance ASC
            LIMIT ? OFFSET ?
        `, ...params, size, offset);
        
        return results;
    }
}

const placeService = new PlaceService();

export { placeService };