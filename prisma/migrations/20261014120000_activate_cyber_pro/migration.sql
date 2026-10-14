-- Activate the consumer Cyber Pro course so /pro renders as live (the owner
-- flipped it conceptually; the catalogue row was still COMING_SOON on prod,
-- which is why /pro showed "Enrol / Opening very soon" with no price).
--
-- Data-only migration: no schema change. It flips the single catalogue row
-- and pins the owner-locked price (GBP 99 == 9900 pence). In any environment
-- where the product is absent it updates 0 rows, so it is safe everywhere and
-- reversible (set status back to 'COMING_SOON' to undo).
--
-- The paid checkout stays held behind the waitlist on the landing
-- (PURCHASE_OPEN=false) until the consumer Stripe flow is wired, so making the
-- course ACTIVE gives nothing away.
UPDATE "Product"
SET "status" = 'ACTIVE', "priceGBP" = 9900
WHERE "slug" = 'cyberstart-pro';
