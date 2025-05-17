import { IReq, IRes } from "@src/routes/common/types";
import { authService } from "@src/services/AuthService";
import { validationResult } from 'express-validator';

class AuthController {
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