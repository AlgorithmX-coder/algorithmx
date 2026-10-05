-- CreateTable
CREATE TABLE "ModelCall" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "course" "CourseKey" NOT NULL,
    "route" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelCall_userId_at_idx" ON "ModelCall"("userId", "at");

-- CreateIndex
CREATE INDEX "ModelCall_at_idx" ON "ModelCall"("at");
