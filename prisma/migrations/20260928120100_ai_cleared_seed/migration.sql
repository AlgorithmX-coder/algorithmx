-- AI Cleared: the product row and the Marlow Fenwick test firm, as a data
-- migration so they land exactly once on every database the schema
-- migration reaches (local, preview, production). Every statement is
-- idempotent (ON CONFLICT DO NOTHING on the natural key), so re-running is
-- harmless and existing rows are never overwritten.
--
-- The main seed (prisma/seed.ts) must NOT be run against production: it
-- drops and recreates CourseContent, and Progress cascades on that FK.

INSERT INTO "Product" ("id", "slug", "name", "ageMin", "ageMax", "priceGBP", "weeks", "status", "emoji", "ageRange", "duration", "weeksCount", "createdAt", "updatedAt")
VALUES ('prod_ai_cleared_000000001', 'ai-cleared', 'AI Cleared', 18, 99, 2900, 0, 'ACTIVE'::"ProductStatus", '🛡️', 'Working adults', 'About 90 minutes', 0, now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Organisation" ("id", "name", "slug", "sector", "contactName", "contactRole", "seatsPurchased", "plan", "createdAt", "updatedAt")
VALUES ('org_marlow_fenwick_000001', 'Marlow Fenwick LLP', 'marlow-fenwick', 'Legal services', 'Priya Nair', 'Data Protection Officer', 25, 'FIRM'::"OrgPlan", now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "FirmProfile" ("id", "orgId", "approvedTools", "askFirstTools", "bannedTools", "escalationContact", "escalationRole", "regulator", "updatedAt")
SELECT 'fp_marlow_fenwick_0000001', o."id",
       ARRAY['Microsoft 365 Copilot on your work account'],
       ARRAY['Claude Team', 'Gemini in Google Workspace'],
       ARRAY['Personal ChatGPT', 'Browser extensions that read the page', 'Meeting note-takers'],
       'Priya Nair', 'Data Protection Officer', 'Solicitors Regulation Authority', now()
FROM "Organisation" o WHERE o."slug" = 'marlow-fenwick'
ON CONFLICT ("orgId") DO NOTHING;

INSERT INTO "Seat" ("id", "orgId", "email", "inviteToken", "team", "trackHint", "invitedAt")
SELECT s."id", o."id", s."email", s."token", s."team", s."track"::"ClearedTrack", now()
FROM "Organisation" o
CROSS JOIN (VALUES
  ('seat_mf_fin_00000000001', 'finance.tester@marlowfenwick.example', 'mf-fin-7q2kd9xw4n8p', 'Finance',  'FINANCE'),
  ('seat_mf_leg_00000000001', 'legal.tester@marlowfenwick.example',   'mf-leg-c3vn8ry5tz1m', 'Disputes', 'LEGAL'),
  ('seat_mf_hr_000000000001', 'hr.tester@marlowfenwick.example',      'mf-hr-p8wz3nq6vd2k',  'People',   'HR'),
  ('seat_mf_gen_00000000001', 'general.tester@marlowfenwick.example', 'mf-gen-h6sm2wq9kb4d', NULL,       NULL),
  ('seat_mf_t2_000000000001', 'tester2@marlowfenwick.example',        'mf-t2-r4kd8mx2sq7b',  NULL,       NULL),
  ('seat_mf_t3_000000000001', 'tester3@marlowfenwick.example',        'mf-t3-z9qn5vh3kw6c',  NULL,       NULL)
) AS s("id", "email", "token", "team", "track")
WHERE o."slug" = 'marlow-fenwick'
ON CONFLICT ("orgId", "email") DO NOTHING;
