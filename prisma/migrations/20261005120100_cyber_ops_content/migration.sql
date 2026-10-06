-- Cyber Ops: the 16 CourseContent rows for product "cyberstart", as a data
-- migration (same pattern as ai_cleared_seed) so they land exactly once on
-- every database the schema migrations reach — local, preview, production.
-- Progress writes FK onto these rows, so they must exist before any play.
-- Idempotent: ON CONFLICT on the (productId, week) natural key does nothing,
-- so re-running is harmless and hand-edited rows are never overwritten.
--
-- Titles/descriptions mirror the LOCKED 16-week curriculum map in
-- docs/operators/cyber-operators-design.md section 8 (and prisma/seed.ts,
-- which is the local-dev source of the same rows; seed.ts must NOT run on
-- production — it drops and recreates CourseContent, cascading Progress).

INSERT INTO "CourseContent" ("id", "productId", "week", "title", "description", "order", "createdAt", "updatedAt")
SELECT w."id", p."id", w."week", w."title", w."description", w."week", now(), now()
FROM "Product" p
CROSS JOIN (VALUES
  ('cc_cyberops_w01', 1,  'Rules of Engagement',       'Meet Redoubt, sign your first scope, and land a fully authorized first capture.'),
  ('cc_cyberops_w02', 2,  'Reconnaissance & OSINT',    'Footprint a fake company from public information. Map the attack surface before you act.'),
  ('cc_cyberops_w03', 3,  'The Web Surface',           'How web apps really work. Use dev tools to intercept and modify requests against the range.'),
  ('cc_cyberops_w04', 4,  'Broken Authentication',     'Credential attacks, weak sessions, and MFA gaps against a fake login.'),
  ('cc_cyberops_w05', 5,  'Injection',                 'Run a real SQL injection against a sandboxed database and extract what the scope allows.'),
  ('cc_cyberops_w06', 6,  'Cross-Site Scripting',      'Inject script into a fake app, simulate cookie theft, and see why client-side trust fails.'),
  ('cc_cyberops_w07', 7,  'Broken Access Control',     'IDOR, forced browsing, and privilege escalation — reach what should not be yours.'),
  ('cc_cyberops_w08', 8,  'Cryptography',              'Encoding vs hashing vs encryption. Break weak and classical crypto, and learn why it matters.'),
  ('cc_cyberops_w09', 9,  'Passwords & Hashes',        'Cracking concepts in-range: salting, rainbow tables, and the case for strong hashing.'),
  ('cc_cyberops_w10', 10, 'Network Recon',             'Port scanning and service enumeration against a fake network.'),
  ('cc_cyberops_w11', 11, 'Digital Forensics',         'Analyse logs and reconstruct a timeline to find the attacker''s trail. Start reading the other side.'),
  ('cc_cyberops_w12', 12, 'Incident Response',         'Now you defend: detect, contain, and eradicate a live simulated breach.'),
  ('cc_cyberops_w13', 13, 'Social Engineering Defence', 'Recognise phishing and pretexting. Analysis only — you spot the con, never author it.'),
  ('cc_cyberops_w14', 14, 'Disclosure & Reporting',    'The craft of the writeup: severity scoring and how real researchers disclose. Portfolio polish.'),
  ('cc_cyberops_w15', 15, 'Full Engagement, Part 1',   'A complete multi-stage engagement against a fake client: recon through exploit.'),
  ('cc_cyberops_w16', 16, 'Full Engagement, Part 2',   'Write the real report, present your findings, and receive a field-ready rating. Season close.')
) AS w("id", "week", "title", "description")
WHERE p."slug" = 'cyberstart'
ON CONFLICT ("productId", "week") DO NOTHING;

-- Keep the cached week count on the Product row in lock-step with the rows
-- just inserted (seed.ts guarantees this locally; the data migration must
-- guarantee it on prod). Does not flip status — COMING_SOON vs ACTIVE stays a
-- separate commercial decision, matched by the content-exists-without-launch
-- pattern already used for Explorers.
UPDATE "Product" p
SET "weeksCount" = (SELECT COUNT(*) FROM "CourseContent" c WHERE c."productId" = p."id"),
    "weeks" = (SELECT COUNT(*) FROM "CourseContent" c WHERE c."productId" = p."id"),
    "updatedAt" = now()
WHERE p."slug" = 'cyberstart';
