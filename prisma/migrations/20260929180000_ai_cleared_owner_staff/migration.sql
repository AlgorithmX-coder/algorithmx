-- The owner tested AI Cleared on the Marlow Fenwick Finance seat, so the
-- account holding that seat is AlgorithmX staff for the ops console.
-- Idempotent: a re-run changes nothing once the role is set.
UPDATE "User" u
SET "role" = 'staff'
FROM "Seat" s
WHERE s."inviteToken" = 'mf-fin-7q2kd9xw4n8p'
  AND s."userId" = u."id"
  AND u."role" <> 'staff';
