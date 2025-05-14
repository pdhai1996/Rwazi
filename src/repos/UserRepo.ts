import { BaseRepo } from "./BaseRepo";
import { User } from "@Prisma/generated/prisma";

export class UserRepo extends BaseRepo<User> {}