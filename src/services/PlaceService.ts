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
    isFavorited?: boolean; // Whether the place is favorited by the current user
}

interface PaginatedSearchResult {
    data: SearchPlacesResult[];
    pagination: {
        page: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
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
     * @param userId - Optional user ID to check if places are favorited
     * @returns Array of places matching the search criteria, with distance from center point
     */    async searchPlaces(
        location: LocationInterface,
        radius: number, // in meters
        serviceId?: number,
        keyword?: string,
        page?: number,
        pageSize?: number,
        userId?: number
    ): Promise<PaginatedSearchResult> {
        // Set default values for pagination
        const currentPage = page && page > 0 ? page : 1;
        const size = pageSize && pageSize > 0 ? pageSize : 20;
        const offset = (currentPage - 1) * size;
        
        // Create the base WHERE clause parameters - these will be used for both queries
        const whereParams: any[] = [
            location.lng,
            location.lat,
            radius
        ];

        // Start building the WHERE clause
        let whereClauses = ["ST_Distance_Sphere(p.location, POINT(?, ?)) <= ?"];
        
        // Add service filter if provided
        if (serviceId !== undefined) {
            whereClauses.push("p.service_id = ?");
            whereParams.push(serviceId);
        }
        
        // Add keyword search if provided
        if (keyword && keyword.trim().length > 0) {
            whereClauses.push("p.name LIKE ?");
            whereParams.push(`%${keyword.trim()}%`);
        }
        
        // Combine WHERE clauses
        const whereClause = whereClauses.join(" AND ");

        // First, get the total count for pagination info
        const countResult = await prisma.$queryRawUnsafe<{total: bigint}[]>(`
            SELECT COUNT(*) as total
            FROM Place p
            JOIN Service s ON p.service_id = s.id
            WHERE ${whereClause}
        `, ...whereParams);
        
        const totalRecords = Number(countResult[0].total);
        const totalPages = Math.ceil(totalRecords / size);

        // Build the parameters for the SELECT query - includes coordinates for distance calculation
        const selectParams = [
            location.lng,    // Add coordinates again for the distance calculation
            location.lat,
            ...whereParams, // Add the WHERE clause parameters
            size,            // Add pagination parameters
            offset
        ];

        // Then get the actual results for the current page
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
        `, ...selectParams);

        // If userId is provided, check which places are favorited by the user
        if (userId) {
            // Get all favorites for this user
            const favorites = await prisma.favorite.findMany({
                where: {
                    user_id: userId,
                    place_id: {
                        in: results.map(place => place.id)
                    }
                }
            });

            // Create a set of favorited place IDs for fast lookup
            const favoritedPlaceIds = new Set(favorites.map(fav => fav.place_id));

            // Mark places as favorited
            results.forEach(place => {
                place.isFavorited = favoritedPlaceIds.has(place.id);
            });
        }
        
        // Return paginated result with metadata
        return {
            data: results,
            pagination: {
                page: currentPage,
                pageSize: size,
                totalRecords,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            }
        };
    }
}

const placeService = new PlaceService();

export { placeService };