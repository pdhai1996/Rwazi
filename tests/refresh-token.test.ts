import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authService } from '@src/services/AuthService';
import { userRepo } from '@src/repos/UserRepo';

// Mock the userRepo
vi.mock('@src/repos/UserRepo', () => ({
  userRepo: {
    findOne: vi.fn(),
  },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('AuthService - Refresh Token', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    name: 'Test User',
  };

  const mockToken = 'new-access-token';
  const mockRefreshToken = 'new-refresh-token';
  const oldRefreshToken = 'old-refresh-token';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the jwt.verify to return decoded token
    jwt.verify = vi.fn().mockReturnValue({
      id: mockUser.id,
      username: mockUser.username,
    });

    // Mock jwt.sign to return tokens
    jwt.sign = vi.fn()
      .mockImplementation((payload, secret, options) => {
        if (options.expiresIn === '15m') {
          return mockToken;
        } else {
          return mockRefreshToken;
        }
      });

    // Mock userRepo.findOne
    userRepo.findOne = vi.fn().mockResolvedValue(mockUser);
  });

  it('should return new tokens when refresh token is valid', async () => {
    const result = await authService.refreshToken(oldRefreshToken);

    expect(jwt.verify).toHaveBeenCalledWith(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      id: mockUser.id,
      username: mockUser.username,
    });
    expect(jwt.sign).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      token: mockToken,
      user: {
        id: mockUser.id,
        username: mockUser.username,
      },
      refreshToken: mockRefreshToken,
      expiresIn: 15 * 60,
      tokenType: 'JWT',
    });
  });

  it('should return null when refresh token is invalid', async () => {
    jwt.verify = vi.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const result = await authService.refreshToken('invalid-token');

    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_REFRESH_SECRET);
    expect(userRepo.findOne).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null when user not found', async () => {
    userRepo.findOne = vi.fn().mockResolvedValue(null);

    const result = await authService.refreshToken(oldRefreshToken);

    expect(jwt.verify).toHaveBeenCalledWith(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    expect(userRepo.findOne).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
