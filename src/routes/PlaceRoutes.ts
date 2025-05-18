import { Router } from 'express';
import { placeController } from '@src/controllers/PlaceController';
import Paths from '@src/common/constants/Paths';
import { placeValidators } from '@src/validators/PlaceValidator';
import { validateRequest } from '@src/middlewares/ValidationMiddleware';
import { AuthMiddleware } from '@src/middlewares/AuthMiddleware';

const placeRouter = Router();

placeRouter.get(
  Paths.Places.Search,
  AuthMiddleware,             // Authentication middleware
  placeValidators.search,     // Apply validation rules
  validateRequest,            // Validation middleware
  placeController.searchPlaces  // Controller
);

export { placeRouter };
