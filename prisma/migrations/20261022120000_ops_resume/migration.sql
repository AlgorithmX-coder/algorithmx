-- Cyber Ops save/resume (account-wide): the section (beat) a learner is part
-- way through, per module, so a module reopens where they left off on any
-- device. One row per (child, module). Additive only.

-- CreateTable
CREATE TABLE "OpsResume" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "beat" TEXT NOT NULL,
    "callsign" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpsResume_childProfileId_week_key" ON "OpsResume"("childProfileId", "week");

-- CreateIndex
CREATE INDEX "OpsResume_childProfileId_idx" ON "OpsResume"("childProfileId");

-- AddForeignKey
ALTER TABLE "OpsResume" ADD CONSTRAINT "OpsResume_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
