import { IReq, IRes } from "@src/routes/common/types";
import { authService } from "@src/services/AuthService";

class AuthController {

  async login(req: IReq, res: IRes): Promise<void> {
    try {
      const { username, password } = req.body as { username: string, password: string };
      const result = await authService.login(username, password);
        if (!result) {
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }else{
            res.status(200).json(result);
        }
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}

export const authController = new AuthController();