import { IReq, IRes } from '@src/routes/common/types';
import { favoriteService } from '@src/services/FavoriteService';

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API endpoints for managing user favorites
 */

class FavoriteController {
  /**
   * @swagger
   * /api/favorites:
   *   post:
   *     summary: Add a place to user's favorites
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - place_id
   *             properties:
   *               place_id:
   *                 type: integer
   *                 description: ID of the place to favorite
   *     responses:
   *       200:
   *         description: Place added to favorites
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 favorite:
   *                   type: object
   *       401:
   *         description: User not authenticated
   *       404:
   *         description: Place not found
   *       500:
   *         description: Server error
   */
  async addFavorite(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { place_id } = req.body;
      
      const favorite = await favoriteService.addFavorite(userId, Number(place_id));
      res.status(200).json({ 
        message: 'Place added to favorites', 
        favorite, 
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Place not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }
  
  /**
   * @swagger
   * /api/favorites/check/{placeId}:
   *   get:
   *     summary: Check if a place is favorited by the current user
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: placeId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the place to check
   *     responses:
   *       200:
   *         description: Returns whether the place is favorited
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isFavorited:
   *                   type: boolean
   *       401:
   *         description: User not authenticated
   *       422:
   *         description: Place ID is required
   *       500:
   *         description: Server error
   */
  async checkFavorite(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { placeId } = req.params;
      
      if (!placeId) {
        res.status(422).json({ message: 'Place ID is required' });
        return;
      }
      
      const isFavorited = await favoriteService.isFavorited(userId, Number(placeId));
      res.status(200).json({ isFavorited });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }

  /**
   * @swagger
   * /api/favorites:
   *   get:
   *     summary: Get favorite places for the current user with pagination
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: pageSize
   *         required: false
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of user's favorite places
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       user_id:
   *                         type: integer
   *                       place_id:
   *                         type: integer
   *                       place:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           name:
   *                             type: string
   *                           longitude:
   *                             type: number
   *                           latitude:
   *                             type: number
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     pageSize:
   *                       type: integer
   *                     totalRecords:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     hasNextPage:
   *                       type: boolean
   *                     hasPreviousPage:
   *                       type: boolean
   *       400:
   *         description: Invalid pagination parameters
   *       401:
   *         description: User not authenticated
   *       500:
   *         description: Server error
   */
  async getUserFavorites(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      // Get pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      
      // Validate pagination parameters
      if (page < 1 || pageSize < 1 || pageSize > 100) {
        res.status(400).json({ message: 'Invalid pagination parameters' });
        return;
      }

      const result = await favoriteService.getUserFavorites(userId, page, pageSize);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }

  /**
   * @swagger
   * /api/favorites/{favoriteId}:
   *   delete:
   *     summary: Remove a place from user's favorites
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: favoriteId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID of the favorite to remove
   *     responses:
   *       200:
   *         description: Favorite successfully removed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       401:
   *         description: User not authenticated
   *       404:
   *         description: Favorite not found or does not belong to user
   *       500:
   *         description: Server error
   */
  async removeFavorite(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { favoriteId } = req.params;
      
      await favoriteService.removeFavorite(userId, Number(favoriteId));
      res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
      if (error instanceof Error && 
          error.message === 'Favorite not found or does not belong to user') {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }
}

const favoriteController = new FavoriteController();
export { favoriteController };
