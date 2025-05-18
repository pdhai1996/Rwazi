import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@src/config/swagger';
import Paths from '@src/common/constants/Paths';

const swaggerRouter = Router();

// Swagger UI setup
swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(swaggerSpec, {
  explorer: true,
}));

// Endpoint to get the Swagger JSON
swaggerRouter.get(Paths.Docs.Json, (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export { swaggerRouter };