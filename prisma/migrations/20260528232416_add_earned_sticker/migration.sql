-- CreateTable
CREATE TABLE "EarnedSticker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "weekNumber" INTEGER,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarnedSticker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EarnedSticker_userId_idx" ON "EarnedSticker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EarnedSticker_userId_stickerId_key" ON "EarnedSticker"("userId", "stickerId");

-- AddForeignKey
ALTER TABLE "EarnedSticker" ADD CONSTRAINT "EarnedSticker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
