import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://dummy:dummy@localhost:5432/dummy";

// Neon (and most cloud PG providers) require SSL. pg parses sslmode=require
// from the URL but doesn't automatically set rejectUnauthorized:false, which
// causes handshake failures. Detect the flag and pass ssl config explicitly.
const ssl = connectionString.includes("sslmode=require")
  ? { rejectUnauthorized: false }
  : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString, ssl }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
