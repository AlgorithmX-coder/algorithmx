-- A second invented test firm, Hollins & Dacre, for the tester's own runs
-- so they never collide with the owner's seats on Marlow Fenwick. An
-- accountancy practice whose approved tool is ChatGPT Business, so the
-- default simulator differs from Marlow Fenwick's Copilot. Idempotent.

INSERT INTO "Organisation" ("id", "name", "slug", "sector", "contactName", "contactRole", "seatsPurchased", "plan", "createdAt", "updatedAt")
VALUES ('org_hollins_dacre_0000001', 'Hollins & Dacre', 'hollins-dacre', 'Accountancy', 'Tom Ashworth', 'Managing Partner', 25, 'TEAM'::"OrgPlan", now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "FirmProfile" ("id", "orgId", "approvedTools", "askFirstTools", "bannedTools", "escalationContact", "escalationRole", "regulator", "updatedAt")
SELECT 'fp_hollins_dacre_00000001', o."id",
       ARRAY['ChatGPT Business on your work login'],
       ARRAY['Microsoft 365 Copilot', 'Claude Team'],
       ARRAY['Personal Gemini', 'Meeting note-takers', 'Browser extensions that read the page'],
       'Tom Ashworth', 'Managing Partner', 'ICAEW', now()
FROM "Organisation" o WHERE o."slug" = 'hollins-dacre'
ON CONFLICT ("orgId") DO NOTHING;

INSERT INTO "Seat" ("id", "orgId", "email", "inviteToken", "team", "trackHint", "role", "invitedAt")
SELECT s."id", o."id", s."email", s."token", s."team", s."track"::"ClearedTrack", s."role"::"OrgRole", now()
FROM "Organisation" o
CROSS JOIN (VALUES
  ('seat_hd_adm_00000000001', 'admin.tester@hollinsdacre.example',   'hd-adm-reaehg49kbrv', 'Admin',    NULL,      'ADMIN'),
  ('seat_hd_fin_00000000001', 'finance.tester@hollinsdacre.example', 'hd-fin-t4pf3zmfk6yj', 'Accounts', 'FINANCE', 'LEARNER'),
  ('seat_hd_hr_000000000001', 'hr.tester@hollinsdacre.example',      'hd-hr-rk6qypgyu4bd',  'People',   'HR',      'LEARNER'),
  ('seat_hd_gen_00000000001', 'general.tester@hollinsdacre.example', 'hd-gen-56cmtat746cv', NULL,       NULL,      'LEARNER'),
  ('seat_hd_t2_000000000001', 'tester2@hollinsdacre.example',        'hd-t2-yx7em3fm22tr',  NULL,       NULL,      'LEARNER'),
  ('seat_hd_t3_000000000001', 'tester3@hollinsdacre.example',        'hd-t3-n6fccgeuqddq',  NULL,       NULL,      'LEARNER'),
  ('seat_hd_t4_000000000001', 'tester4@hollinsdacre.example',        'hd-t4-9ff9q3akm3zt',  NULL,       NULL,      'LEARNER')
) AS s("id", "email", "token", "team", "track", "role")
WHERE o."slug" = 'hollins-dacre'
ON CONFLICT ("orgId", "email") DO NOTHING;
