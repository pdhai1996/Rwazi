import client from "@prisma/client";
const prisma = client;
export default async () => {
  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.place.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};