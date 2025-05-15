import { BaseRepo } from "./BaseRepo";
import { User } from "@Prisma/generated/prisma";

class UserRepo extends BaseRepo<User> {}

export const userRepo = new UserRepo('user');