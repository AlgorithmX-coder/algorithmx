-- A place is one child on ONE course.
--
-- Owner, 2026-11-09: the place follows the child, but it is only good for one
-- course. So moving a pupil between classes of the same course is free, and a
-- pupil who finishes a course and starts the next one spends a second place.
--
-- The ledger physically could not hold that. "childProfileId" was UNIQUE, so
-- one child was one place, full stop, and moving a pupil up a course next
-- September cost nothing for ever. This swaps that constraint for one place
-- per child per course.
--
-- Written by hand rather than by `prisma migrate dev`, because the only
-- database reachable from a dev machine here is production and migrate dev
-- resets whatever it points at.
--
-- SAFE ON EXISTING DATA. One nullable column added and backfilled, one index
-- swapped for a wider one that cannot reject any row the narrower one
-- allowed, and nothing dropped or renamed. Every statement is a no-op on an
-- empty database, so a fresh environment migrates cleanly.

-- AlterTable: which course this place was spent on. Nullable, because the
-- rows written before the rule existed cannot all be answered.
ALTER TABLE "PlaceRedemption" ADD COLUMN "productId" TEXT;

-- Backfill from the class the child sits in, which is where the course came
-- from when the place was spent. Pupils in archived classes are included:
-- they spent a place on that class's course too.
--
-- A row whose pupil has already left has no class to read and stays null. It
-- is deliberately NOT guessed: that place is spent and not coming back
-- either way, so the course it was spent on changes no number anybody acts
-- on, and inventing one would put a fact in the ledger that nobody checked.
UPDATE "PlaceRedemption" pr
SET "productId" = c."productId"
FROM "ChildProfile" cp
JOIN "Class" c ON c."id" = cp."classId"
WHERE pr."childProfileId" = cp."id"
  AND pr."productId" IS NULL;

-- DropIndex: one place per child was the old rule.
DROP INDEX IF EXISTS "PlaceRedemption_childProfileId_key";

-- CreateIndex: one place per child PER COURSE is the new one.
--
-- Postgres treats rows containing a null as distinct for uniqueness, which is
-- what makes this safe for the two null cases already in the table: the
-- departed pupils (childProfileId null) do not collide with each other, and
-- nor do the pre-rule rows that could not be backfilled. Each of those is a
-- separate place that was spent and is not coming back.
CREATE UNIQUE INDEX "PlaceRedemption_childProfileId_productId_key"
  ON "PlaceRedemption"("childProfileId", "productId");

-- CreateIndex
CREATE INDEX "PlaceRedemption_productId_idx" ON "PlaceRedemption"("productId");

-- AddForeignKey: SET NULL, never cascade. Retiring a course must not erase
-- the record that a school spent places on it.
ALTER TABLE "PlaceRedemption"
  ADD CONSTRAINT "PlaceRedemption_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
