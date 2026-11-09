-- Desk Ready: the product row for the new individuals-only course (desk and
-- computer skills for adults moving into office work). A data migration so it
-- lands exactly once on every database the schema migration reaches (local,
-- preview, production). Idempotent on the natural key, so re-running is
-- harmless and an existing row is never overwritten.
--
-- £99 is the consumer price, VAT inclusive (owner ruling 2026-11-09). There is
-- no consumer checkout yet: the purchase stub grants free, as for the other
-- individual courses.

INSERT INTO "Product" ("id", "slug", "name", "ageMin", "ageMax", "priceGBP", "weeks", "status", "emoji", "ageRange", "duration", "weeksCount", "createdAt", "updatedAt")
VALUES ('prod_desk_ready_000000001', 'desk-ready', 'Desk Ready', 18, 99, 9900, 0, 'ACTIVE'::"ProductStatus", '💼', 'Adults', 'About 15 hours', 0, now(), now())
ON CONFLICT ("slug") DO NOTHING;
