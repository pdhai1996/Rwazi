import { BaseRepo } from './BaseRepo';
import { User } from '@prisma/generated/prisma';

class UserRepo extends BaseRepo<User> {}

export const userRepo = new UserRepo('user');