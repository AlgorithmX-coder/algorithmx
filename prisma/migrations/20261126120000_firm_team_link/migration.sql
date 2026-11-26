-- The firm team link (app/lib/firmTeamLink.ts): one join link per firm
-- that anyone at the firm can open to take a seat, and seats a lead can
-- hand back. Purely additive: three nullable columns on Organisation, one
-- on Seat, one unique index. No data is changed. A firm's token is made
-- the first time its console opens (ensureTeamLink), so nothing needs a
-- backfill here.

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "teamDomain" TEXT,
ADD COLUMN     "teamFullNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "teamToken" TEXT;

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "removedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_teamToken_key" ON "Organisation"("teamToken");
