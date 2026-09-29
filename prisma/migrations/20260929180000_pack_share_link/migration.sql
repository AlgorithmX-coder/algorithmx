-- A read-only link to one week's teacher pack, so a school can be shown the
-- product before anybody has an account.
--
-- Written by hand rather than by `prisma migrate dev`, because the only
-- database reachable from a dev machine here is production and migrate dev
-- resets whatever it points at. The column types and constraint names below
-- follow the shapes Prisma generated for Seat and Certificate in
-- 20260928120000_ai_cleared, so `migrate deploy` and the generated client
-- agree about this table.

-- CreateTable
CREATE TABLE "PackShareLink" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "label" TEXT,
    "orgId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "opens" INTEGER NOT NULL DEFAULT 0,
    "lastOpenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackShareLink_tokenHash_key" ON "PackShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "PackShareLink_orgId_idx" ON "PackShareLink"("orgId");

-- CreateIndex
CREATE INDEX "PackShareLink_createdById_idx" ON "PackShareLink"("createdById");

-- AddForeignKey
ALTER TABLE "PackShareLink" ADD CONSTRAINT "PackShareLink_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackShareLink" ADD CONSTRAINT "PackShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
