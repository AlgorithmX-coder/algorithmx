import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

export const prisma: PrismaClient | null =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL
    ? new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
      })
    : null);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
