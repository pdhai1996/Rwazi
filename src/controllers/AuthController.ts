import { IReq, IRes } from '@src/routes/common/types';
import { authService } from '@src/services/AuthService';
import { validationResult } from 'express-validator';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

class AuthController {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: User's username
   *               password:
   *                 type: string
   *                 description: User's password
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: JWT access token
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     username:
   *                       type: string
   *       401:
   *         description: Invalid username or password
   *       422:
   *         description: Validation error
   *       500:
   *         description: Server error
   */
  async login(req: IReq, res: IRes): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
      
      const { username, password } = req.body as { username: string, password: string };
      const result = await authService.login(username, password);
      if (!result) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const authController = new AuthController();