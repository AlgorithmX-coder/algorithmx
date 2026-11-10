-- Desk Ready (consumer, individuals): server-side progress, so a logged-in
-- learner's finished lessons and office jobs, and each job's pretend office,
-- follow them across devices. Purely additive: two new tables, no changes to
-- existing tables. The client keeps localStorage as its primary store and
-- syncs here best-effort, so these tables being briefly absent never breaks
-- the course.

-- CreateTable
CREATE TABLE "DeskProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeskOffice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeskOffice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeskProgress_userId_idx" ON "DeskProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeskProgress_userId_itemId_key" ON "DeskProgress"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "DeskOffice_userId_jobId_key" ON "DeskOffice"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "DeskProgress" ADD CONSTRAINT "DeskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeskOffice" ADD CONSTRAINT "DeskOffice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
