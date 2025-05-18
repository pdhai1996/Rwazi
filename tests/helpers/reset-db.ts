import prisma from "@src/common/prisma";
export default async () => {
  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.place.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};