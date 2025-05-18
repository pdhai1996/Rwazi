// filepath: /var/www/LocationSearch/src/services/FavoriteService.ts
import { PrismaClient } from '@prisma/generated/prisma';
import prisma from '../../prisma/client';

interface FavoriteCreateInterface {
  user_id: number;
  place_id: number;
}

class FavoriteService {
  /**
   * Add a place to user's favorites
   * @param userId User ID
   * @param placeId Place ID
   * @returns The created favorite record
   */
  async addFavorite(userId: number, placeId: number) {
    try {
      // First check if the place exists
      const place = await prisma.place.findUnique({ where: { id: placeId } });
      if (!place) {
        throw new Error('Place not found');
      }

      // Check if favorite already exists
      const existingFavorite = await prisma.favorite.findFirst({
        where: {
          user_id: userId,
          place_id: placeId
        }
      });

      if (existingFavorite) {
        return existingFavorite; // Already favorited
      }

      // Create a new favorite
      return await prisma.favorite.create({
        data: {
          user_id: userId,
          place_id: placeId
        },
        include: {
          place: true
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get favorites for a user with pagination
   * @param userId User ID
   * @param page Page number (starts from 1)
   * @param pageSize Number of items per page
   * @returns Object containing paged favorites and pagination metadata
   */
  async getUserFavorites(userId: number, page: number = 1, pageSize: number = 10) {
    try {
      // Calculate skip value for pagination
      const skip = (page - 1) * pageSize;
      
      // Get total count for pagination metadata
      const totalCount = await prisma.favorite.count({
        where: {
          user_id: userId
        }
      });
      
      // Get paginated favorites
      const favorites = await prisma.favorite.findMany({
        where: {
          user_id: userId
        },
        include: {
          place: {
            include: {
              service: true
            }
          }
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc' // Most recently added first
        }
      });

      const mappedFavorites = favorites.map(fav => ({
        id: fav.id,
        place_id: fav.place_id,
        place: {
          ...fav.place,
          serviceName: fav.place.service.name
        },
        createdAt: fav.createdAt
      }));
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);
      
      return {
        data: mappedFavorites,
        pagination: {
          page,
          pageSize,
          totalRecords: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove a place from user's favorites
   * @param userId User ID
   * @param favoriteId Favorite ID
   * @returns The result of the delete operation
   */
  async removeFavorite(userId: number, favoriteId: number) {
    try {
      // First check if the favorite exists and belongs to the user
      const favorite = await prisma.favorite.findFirst({
        where: {
          id: favoriteId,
          user_id: userId
        }
      });

      if (!favorite) {
        throw new Error('Favorite not found or does not belong to user');
      }

      // Delete the favorite
      return await prisma.favorite.delete({
        where: {
          id: favoriteId
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a place is favorited by a user
   * @param userId User ID
   * @param placeId Place ID
   * @returns Boolean indicating if place is favorited
   */
  async isFavorited(userId: number, placeId: number) {
    try {
      const favorite = await prisma.favorite.findFirst({
        where: {
          user_id: userId,
          place_id: placeId
        }
      });

      return favorite !== null;
    } catch (error) {
      throw error;
    }
  }
}

const favoriteService = new FavoriteService();
export { favoriteService };
