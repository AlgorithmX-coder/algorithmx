-- The school's one staff join link (app/lib/staffLink.ts). Purely additive:
-- three nullable columns, null for every existing school until its lead
-- first opens the overview, and a unique index on the token.

-- AlterTable
ALTER TABLE "SchoolProfile" ADD COLUMN     "staffLinkDomain" TEXT,
ADD COLUMN     "staffLinkMadeAt" TIMESTAMP(3),
ADD COLUMN     "staffLinkToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProfile_staffLinkToken_key" ON "SchoolProfile"("staffLinkToken");
