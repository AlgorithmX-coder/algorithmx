-- Places, as a permanent ledger, and the course a class runs.
--
-- Until now a school's used places were COUNTED live: pupils sitting in
-- classes that are not archived. That means removing a pupil handed the place
-- back, and archiving a class at the end of a year handed back the whole
-- class. The commercial model is the opposite: a place spent is spent, and a
-- school that runs out buys more. So the count becomes a ledger, with one
-- permanent row per place redeemed.
--
-- Written by hand rather than by `prisma migrate dev`, because the only
-- database reachable from a dev machine here is production and migrate dev
-- resets whatever it points at.
--
-- SAFE ON EXISTING DATA. One new table, one new column backfilled before it
-- is made required, and no column dropped or renamed. The two backfills are
-- both no-ops on an empty database, so a fresh environment migrates cleanly.

-- CreateTable: one row per place a school has spent.
--
-- `childProfileId` is NULLABLE on purpose, with ON DELETE SET NULL below.
-- When a pupil leaves and their account goes, the row stays behind with a
-- null child: that is precisely the record that the place was spent and is
-- not coming back. It carries no name, so a departed pupil leaves nothing
-- behind that identifies them.
CREATE TABLE "PlaceRedemption" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "childProfileId" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditedBackAt" TIMESTAMP(3),
    "creditedBy" TEXT,

    CONSTRAINT "PlaceRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: one place per child, so a pupil cannot consume two.
CREATE UNIQUE INDEX "PlaceRedemption_childProfileId_key" ON "PlaceRedemption"("childProfileId");

-- CreateIndex
CREATE INDEX "PlaceRedemption_orgId_idx" ON "PlaceRedemption"("orgId");

-- AddForeignKey
ALTER TABLE "PlaceRedemption" ADD CONSTRAINT "PlaceRedemption_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SET NULL, never CASCADE. A cascade here would delete the
-- ledger row along with the pupil and hand the place back, which is the whole
-- behaviour this migration exists to stop.
ALTER TABLE "PlaceRedemption" ADD CONSTRAINT "PlaceRedemption_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: every pupil who already exists has already consumed a place.
-- Without this the first deploy would show every school as having used none
-- of its licence. Dated from the child's own createdAt so the history is
-- honest rather than all stamped with the deploy time. Pupils in archived
-- classes are included: they spent a place too.
INSERT INTO "PlaceRedemption" ("id", "orgId", "childProfileId", "redeemedAt")
SELECT 'plc_' || cp."id", c."orgId", cp."id", cp."createdAt"
FROM "ChildProfile" cp
JOIN "Class" c ON c."id" = cp."classId"
WHERE cp."classId" IS NOT NULL;

-- AlterTable: which of the courses this class runs. Added nullable, backfilled,
-- then made required, so no existing row can violate it.
ALTER TABLE "Class" ADD COLUMN "productId" TEXT;

-- Backfill: every class that exists today is a Cyber Heroes class, because
-- until now that was the only course the school platform served.
UPDATE "Class" SET "productId" = (SELECT "id" FROM "Product" WHERE "slug" = 'cyber-heroes')
WHERE "productId" IS NULL;

-- Now it can be required. On an empty database the update above touched
-- nothing and this still succeeds.
ALTER TABLE "Class" ALTER COLUMN "productId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Class_productId_idx" ON "Class"("productId");

-- AddForeignKey: RESTRICT, so a course cannot be deleted out from under a
-- class full of children.
ALTER TABLE "Class" ADD CONSTRAINT "Class_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
