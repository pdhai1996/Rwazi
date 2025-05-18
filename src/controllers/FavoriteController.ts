import { IReq, IRes } from "@src/routes/common/types";
import { favoriteService } from "@src/services/FavoriteService";

class FavoriteController {
  /**
   * Add a place to user's favorites
   */
  async addFavorite(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { placeId } = req.body;
      
      const favorite = await favoriteService.addFavorite(userId, Number(placeId));
      res.status(200).json({ 
        message: 'Place added to favorites', 
        favorite 
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
   * Check if a place is favorited by the current user
   */
  async checkFavorite(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { placeId } = req.params;
      
      const isFavorited = await favoriteService.isFavorited(userId, Number(placeId));
      res.status(200).json({ isFavorited });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }

  /**
   * Get all favorite places for the current user
   */
  async getUserFavorites(req: IReq, res: IRes): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const favorites = await favoriteService.getUserFavorites(userId);
      res.status(200).json({ favorites });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }

  /**
   * Remove a place from user's favorites
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
