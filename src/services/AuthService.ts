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

  async refreshToken(refreshToken: string): Promise<ILoginDto | null> {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET!
      ) as jwt.JwtPayload;
      
      // Get user from decoded token
      const user = await userRepo.findOne({
        id: decoded.id,
        username: decoded.username,
      });

      if (!user) {
        return null;
      }

      // Generate new tokens
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' },
      );

      const newRefreshToken = jwt.sign(
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
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60,
        tokenType: 'JWT',
      };
    } catch (error) {
      // Invalid or expired refresh token
      return null;
    }
  }
}

const authService = new AuthService();

export { authService };