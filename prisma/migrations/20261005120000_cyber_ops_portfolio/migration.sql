-- Cyber Ops portfolio: the pentest-style finding each engagement files.
-- Week progress + reputation reuse the existing Progress spine (xp = rep),
-- so this is the tier's only new table.

-- CreateEnum
CREATE TYPE "OpsSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "OpsFinding" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "callsign" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "OpsSeverity" NOT NULL,
    "cvss" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpsFinding_childProfileId_week_key" ON "OpsFinding"("childProfileId", "week");

-- CreateIndex
CREATE INDEX "OpsFinding_childProfileId_idx" ON "OpsFinding"("childProfileId");

-- AddForeignKey
ALTER TABLE "OpsFinding" ADD CONSTRAINT "OpsFinding_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
