import { PrismaClient } from '@/app/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.$connect();
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn('Database connection failed:', error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await db.$disconnect();
  } catch (error) {
    console.warn('Error disconnecting from database:', error);
  }
}