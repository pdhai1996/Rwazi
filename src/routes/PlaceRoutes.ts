import { Router } from 'express';
import { placeController } from '@src/controllers/PlaceController';
import Paths from '@src/common/constants/Paths';
import { placeValidators } from '@src/validators/PlaceValidator';
import { validateRequest } from '@src/middlewares/ValidationMiddleware';

const placeRouter = Router();

// Search places endpoint with validation
placeRouter.get(
  Paths.Places.Search,
  placeValidators.search,     // Apply validation rules
  validateRequest,            // Validation middleware
  (req, res) => placeController.searchPlaces(req, res)  // Controller
);

export { placeRouter };
