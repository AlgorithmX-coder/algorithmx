-- CreateEnum
CREATE TYPE "OrgPlan" AS ENUM ('TEAM', 'FIRM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'MANAGER', 'LEARNER');

-- CreateEnum
CREATE TYPE "ClearedTrack" AS ENUM ('FINANCE', 'LEGAL', 'HR', 'SALES', 'SUPPORT', 'OPS', 'IT', 'LEADERSHIP', 'GENERAL');

-- CreateEnum
CREATE TYPE "ModulePhase" AS ENUM ('LEARN', 'PRACTISE', 'PROVE', 'DONE');

-- CreateEnum
CREATE TYPE "SandboxTool" AS ENUM ('COPILOT', 'CHATGPT', 'GEMINI', 'CLAUDE');

-- CreateEnum
CREATE TYPE "SandboxVerdict" AS ENUM ('OK', 'WARN', 'CRIT');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector" TEXT,
    "contactName" TEXT,
    "contactRole" TEXT,
    "seatsPurchased" INTEGER NOT NULL DEFAULT 0,
    "plan" "OrgPlan" NOT NULL DEFAULT 'TEAM',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgMember" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'LEARNER',
    "team" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "inviteToken" TEXT NOT NULL,
    "team" TEXT,
    "trackHint" "ClearedTrack",
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmProfile" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "approvedTools" TEXT[],
    "askFirstTools" TEXT[],
    "bannedTools" TEXT[],
    "classPublic" TEXT NOT NULL DEFAULT 'PUBLIC',
    "classInternal" TEXT NOT NULL DEFAULT 'INTERNAL',
    "classConfidential" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
    "classRestricted" TEXT NOT NULL DEFAULT 'RESTRICTED',
    "escalationContact" TEXT NOT NULL,
    "escalationRole" TEXT,
    "regulator" TEXT,
    "policyText" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrolment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "track" "ClearedTrack" NOT NULL DEFAULT 'GENERAL',
    "trackChangedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "finalScore" INTEGER,

    CONSTRAINT "Enrolment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleProgress" (
    "id" TEXT NOT NULL,
    "enrolmentId" TEXT NOT NULL,
    "module" INTEGER NOT NULL,
    "phase" "ModulePhase" NOT NULL DEFAULT 'LEARN',
    "screen" INTEGER NOT NULL DEFAULT 0,
    "proveScore" INTEGER,
    "proveTotal" INTEGER,
    "bestVerdict" "SandboxVerdict",
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SandboxAttempt" (
    "id" TEXT NOT NULL,
    "enrolmentId" TEXT NOT NULL,
    "module" INTEGER NOT NULL,
    "tool" "SandboxTool" NOT NULL,
    "verdict" "SandboxVerdict" NOT NULL,
    "countPublic" INTEGER NOT NULL DEFAULT 0,
    "countInternal" INTEGER NOT NULL DEFAULT 0,
    "countConfidential" INTEGER NOT NULL DEFAULT 0,
    "countRestricted" INTEGER NOT NULL DEFAULT 0,
    "halted" BOOLEAN NOT NULL DEFAULT false,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SandboxAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "enrolmentId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");

-- CreateIndex
CREATE INDEX "OrgMember_userId_idx" ON "OrgMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_orgId_userId_key" ON "OrgMember"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_inviteToken_key" ON "Seat"("inviteToken");

-- CreateIndex
CREATE INDEX "Seat_userId_idx" ON "Seat"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_orgId_email_key" ON "Seat"("orgId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "FirmProfile_orgId_key" ON "FirmProfile"("orgId");

-- CreateIndex
CREATE INDEX "Enrolment_orgId_idx" ON "Enrolment"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_userId_productId_key" ON "Enrolment"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleProgress_enrolmentId_module_key" ON "ModuleProgress"("enrolmentId", "module");

-- CreateIndex
CREATE INDEX "SandboxAttempt_enrolmentId_idx" ON "SandboxAttempt"("enrolmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_enrolmentId_key" ON "Certificate"("enrolmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_serial_key" ON "Certificate"("serial");

-- CreateIndex
CREATE INDEX "Certificate_orgId_idx" ON "Certificate"("orgId");

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmProfile" ADD CONSTRAINT "FirmProfile_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "Enrolment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SandboxAttempt" ADD CONSTRAINT "SandboxAttempt_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "Enrolment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "Enrolment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

