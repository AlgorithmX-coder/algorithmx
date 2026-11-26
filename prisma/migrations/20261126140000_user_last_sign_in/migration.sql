-- Data retention (app/lib/retention.ts). Purely additive: two nullable columns
-- on User, null for every existing account. lastSignInAt is stamped on each
-- sign-in from now on; retentionWarnedAt records the 30-day warning email.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSignInAt" TIMESTAMP(3),
ADD COLUMN     "retentionWarnedAt" TIMESTAMP(3);
