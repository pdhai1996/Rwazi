import { User } from '@src/generated/prisma';
import { userRepo } from '../repos/UserRepo';
import { createHash } from 'crypto';
export const UserController = {
  // getAll: async (req, res) => {
  // },
    
  add: async () => {
    const fakeUser : Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'John Doe',
      username: 'rwazi',
      password: createHash('sha256').update('password').digest('hex'),
    };
    await userRepo.create(fakeUser);
  },
    
  // update: async (req, res) => {
  //     const { user } = Validators.update(req.body);
  //     await UserService.updateOne(user);
  //     res.status(HttpStatusCodes.OK).end();
  // },
    
  // delete: async (req, res) => {
  //     const { id } = Validators.delete(req.params);
  //     await UserService.delete(id);
  //     res.status(HttpStatusCodes.OK).end();
  // },
};