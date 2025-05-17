import { PrismaClient } from "@prisma/generated/prisma";
const prisma = new PrismaClient();
export default async () => {
  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.place.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ])
}