-- CreateTable
CREATE TABLE "LessonAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "finalScreenIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "screenIndex" INTEGER NOT NULL,
    "screenType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "hintTierReached" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "starsEarned" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "ScreenResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionResponse" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "screenIndex" INTEGER NOT NULL,
    "questionKey" TEXT NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "attemptIndex" INTEGER NOT NULL DEFAULT 1,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL,
    "bestCombo" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "badgeEarned" BOOLEAN NOT NULL DEFAULT false,
    "badgeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BossResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "userId" TEXT NOT NULL,
    "comfortMode" BOOLEAN NOT NULL DEFAULT false,
    "narrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "LessonAttempt_userId_weekNumber_idx" ON "LessonAttempt"("userId", "weekNumber");

-- CreateIndex
CREATE INDEX "LessonAttempt_userId_completed_idx" ON "LessonAttempt"("userId", "completed");

-- CreateIndex
CREATE INDEX "ScreenResult_attemptId_idx" ON "ScreenResult"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreenResult_attemptId_screenIndex_key" ON "ScreenResult"("attemptId", "screenIndex");

-- CreateIndex
CREATE INDEX "QuestionResponse_attemptId_idx" ON "QuestionResponse"("attemptId");

-- CreateIndex
CREATE INDEX "QuestionResponse_questionKey_wasCorrect_idx" ON "QuestionResponse"("questionKey", "wasCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "BossResult_attemptId_key" ON "BossResult"("attemptId");

-- AddForeignKey
ALTER TABLE "LessonAttempt" ADD CONSTRAINT "LessonAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenResult" ADD CONSTRAINT "ScreenResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LessonAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LessonAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossResult" ADD CONSTRAINT "BossResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LessonAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
