-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "trialExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TeacherInvite" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviteToken" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MANAGER',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "TeacherInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherInvite_inviteToken_key" ON "TeacherInvite"("inviteToken");

-- CreateIndex
CREATE INDEX "TeacherInvite_userId_idx" ON "TeacherInvite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherInvite_orgId_email_key" ON "TeacherInvite"("orgId", "email");

-- AddForeignKey
ALTER TABLE "TeacherInvite" ADD CONSTRAINT "TeacherInvite_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherInvite" ADD CONSTRAINT "TeacherInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

