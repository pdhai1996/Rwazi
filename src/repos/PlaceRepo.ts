import { BaseRepo } from './BaseRepo';
import { Place } from '@prisma/generated/prisma';

class UserRepo extends BaseRepo<Place> {}

export const placeRepo = new UserRepo('place');