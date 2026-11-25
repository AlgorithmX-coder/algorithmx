-- Session hardening (app/lib/sessionValidity.ts): when the password was last
-- set by a reset or change. Sessions that signed in before it are refused.
-- Purely additive: one nullable column, null for every existing account, so
-- nobody is signed out by the deploy.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordChangedAt" TIMESTAMP(3);
