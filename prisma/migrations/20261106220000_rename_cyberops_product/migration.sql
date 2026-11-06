-- The product row for slug "cyberstart" (Cyber Ops, the 14-17 tier) still
-- carries its original placeholder display name "CyberStart" on existing
-- databases, pre-dating the rename to "Cyber Ops" already reflected in
-- prisma/seed.ts. seed.ts is never run on production (it drops and
-- recreates CourseContent, cascading Progress), so the renamed value never
-- reached prod - it surfaced as "CyberStart" in the admin portal's
-- Individuals tab. Idempotent: a no-op once the name already matches.
UPDATE "Product"
SET "name" = 'Cyber Ops',
    "updatedAt" = now()
WHERE "slug" = 'cyberstart'
  AND "name" <> 'Cyber Ops';
