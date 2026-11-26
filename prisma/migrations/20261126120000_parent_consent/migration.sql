-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "needsParentConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentConsentAt" TIMESTAMP(3),
ADD COLUMN     "parentEmail" TEXT;

-- CreateTable
CREATE TABLE "ParentConsentToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentConsentToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentConsentToken_tokenHash_key" ON "ParentConsentToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ParentConsentToken_userId_idx" ON "ParentConsentToken"("userId");

-- AddForeignKey
ALTER TABLE "ParentConsentToken" ADD CONSTRAINT "ParentConsentToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

