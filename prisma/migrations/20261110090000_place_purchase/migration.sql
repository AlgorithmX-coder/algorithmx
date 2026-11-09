-- A record of each card purchase of pupil places, so a second purchase can
-- top up the organisation the buyer already runs.
--
-- Until now the only record of a places purchase was
-- Organisation.stripeCheckoutSessionId, which holds exactly one session. A
-- second purchase therefore had nowhere to be recorded, and fulfilment took
-- the only path it had: create another organisation. The buyer ended up with
-- two records, two invites, and their places split between them.
--
-- Written by hand rather than by `prisma migrate dev`, because the only
-- database reachable from a dev machine here is production and migrate dev
-- resets whatever it points at.
--
-- SAFE ON EXISTING DATA. One new table, nothing altered, nothing dropped.
-- The backfill below is a no-op on an empty database, so a fresh environment
-- migrates cleanly.

-- CreateTable
CREATE TABLE "PlacePurchase" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "places" INTEGER NOT NULL,
    "netPence" INTEGER NOT NULL,
    "leadEmail" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: the constraint that stops one payment becoming two lots of
-- places. Stripe delivers a webhook at least once, so this is load-bearing
-- and belongs in the database rather than in a check in application code.
CREATE UNIQUE INDEX "PlacePurchase_stripeCheckoutSessionId_key" ON "PlacePurchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "PlacePurchase_orgId_idx" ON "PlacePurchase"("orgId");

-- AddForeignKey
ALTER TABLE "PlacePurchase" ADD CONSTRAINT "PlacePurchase_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: any organisation already created by a card purchase gets its
-- purchase row, so the history starts complete rather than starting from
-- this deploy. netPence is 0 because the amount was never stored anywhere to
-- recover it from, and a made-up figure would be worse than an obvious gap.
-- leadEmail likewise is unknown for these, so it is left empty rather than
-- guessed from a contact name.
INSERT INTO "PlacePurchase" ("id", "orgId", "places", "netPence", "leadEmail", "stripeCheckoutSessionId", "createdAt")
SELECT 'plp_' || o."id", o."id", o."seatsPurchased", 0, '', o."stripeCheckoutSessionId", o."createdAt"
FROM "Organisation" o
JOIN "SchoolProfile" sp ON sp."orgId" = o."id"
WHERE o."stripeCheckoutSessionId" IS NOT NULL;
