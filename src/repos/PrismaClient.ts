import { PrismaClient } from '@src/generated/prisma';
// Create a single instance of PrismaClient to be used throughout the application
const prisma = new PrismaClient();

export default prisma;