import { Router } from 'express';
import { favoriteController } from '@src/controllers/FavoriteController';
import Paths from '@src/common/constants/Paths';
import { favoriteValidators } from '@src/validators/FavoriteValidator';
import { validateRequest } from '@src/middlewares/ValidationMiddleware';
import { AuthMiddleware } from '@src/middlewares/AuthMiddleware';

const favoriteRouter = Router();

// All favorite routes require authentication
favoriteRouter.use(AuthMiddleware);

// Add place to favorites
favoriteRouter.post(
  Paths.Favorites.Add,
  favoriteValidators.addFavorite,
  validateRequest,
  favoriteController.addFavorite
);

// Get all user favorites
favoriteRouter.get(
  Paths.Favorites.Get,
  favoriteController.getUserFavorites
);

// Remove a favorite
favoriteRouter.delete(
  Paths.Favorites.Remove,
  favoriteValidators.removeFavorite,
  validateRequest,
  favoriteController.removeFavorite
);

// Check if place is favorited
favoriteRouter.get(
  Paths.Favorites.Check,
  favoriteValidators.checkFavorite,
  validateRequest,
  favoriteController.checkFavorite
);

export { favoriteRouter };
