-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ageRange" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "emoji" TEXT NOT NULL,
ADD COLUMN     "weeksCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "courseContentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CourseContent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseContent_productId_idx" ON "CourseContent"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseContent_productId_week_key" ON "CourseContent"("productId", "week");

-- CreateIndex
CREATE INDEX "Progress_courseContentId_idx" ON "Progress"("courseContentId");

-- AddForeignKey
ALTER TABLE "CourseContent" ADD CONSTRAINT "CourseContent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_courseContentId_fkey" FOREIGN KEY ("courseContentId") REFERENCES "CourseContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
