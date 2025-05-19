import { Router } from 'express';
import { authController } from '@src/controllers/AuthController';
import { authValidator } from '@src/validators/AuthValidator';

const authRouter = Router();

// eslint-disable-next-line @typescript-eslint/unbound-method
authRouter.post('/login', authValidator.login, authController.login);

// eslint-disable-next-line @typescript-eslint/unbound-method
authRouter.post('/refresh', authValidator.refresh, authController.refreshToken);

export { authRouter };