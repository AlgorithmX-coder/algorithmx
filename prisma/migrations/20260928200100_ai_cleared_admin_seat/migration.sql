-- An invite seat can carry a role, so a firm's admin is invited the same
-- way as a learner and becomes ADMIN on claim.
ALTER TABLE "Seat" ADD COLUMN "role" "OrgRole" NOT NULL DEFAULT 'LEARNER';

-- The Marlow Fenwick test firm gets an admin seat. Idempotent.
INSERT INTO "Seat" ("id", "orgId", "email", "inviteToken", "team", "role", "invitedAt")
SELECT 'seat_mf_adm_00000000001', o."id", 'admin.tester@marlowfenwick.example', 'mf-adm-k7wq2xv9nd4h', 'Admin', 'ADMIN'::"OrgRole", now()
FROM "Organisation" o WHERE o."slug" = 'marlow-fenwick'
ON CONFLICT ("orgId", "email") DO NOTHING;
