-- Cyber Pro (consumer, adult): server-side course progress, so a logged-in
-- learner's completed topics follow them across devices. Purely additive: one
-- new table, no changes to existing tables. The client keeps using
-- localStorage as its primary store and syncs here best-effort, so this table
-- being briefly absent never breaks the course.

-- CreateTable
CREATE TABLE "ProProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProProgress_userId_idx" ON "ProProgress"("userId");

-- CreateIndex
CREATE INDEX "ProProgress_userId_moduleId_idx" ON "ProProgress"("userId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ProProgress_userId_topicId_key" ON "ProProgress"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "ProProgress" ADD CONSTRAINT "ProProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
