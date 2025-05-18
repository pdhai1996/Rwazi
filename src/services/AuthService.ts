import { ILoginDto } from '@src/dtos/AuthDto';
import { userRepo } from '@src/repos/UserRepo';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';

class AuthService {
  async login(username: string, password: string): Promise<ILoginDto | null> {
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    const user = await userRepo.findOne({
      username,
      password: hashedPassword,
    });
    if (!user) {
      return null;
    }
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '7d' },
    );
    return {
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
      },
      refreshToken,
      expiresIn: 15 * 60,
      tokenType: 'JWT',
    };
  }
}

const authService = new AuthService();

export { authService };