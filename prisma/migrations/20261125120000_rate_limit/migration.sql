-- Rate limiting (app/lib/rateLimit.ts): fixed-window counters keyed by a
-- bucket name plus a hash of the subject. Purely additive: one new table,
-- no changes to existing tables. If it is briefly absent the limiter fails
-- open, so sign-in never breaks on it.

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");
