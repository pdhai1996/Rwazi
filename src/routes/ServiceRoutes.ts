import { Router } from 'express';
import { serviceController } from '@src/controllers/ServiceController';
import Paths from '@src/common/constants/Paths';
import { AuthMiddleware } from '@src/middlewares/AuthMiddleware';

const serviceRouter = Router();

// Get all services endpoint
serviceRouter.get(
  Paths.Services.GetAll,
  AuthMiddleware, // Authentication middleware
  serviceController.getAllServices,
);

export { serviceRouter };
