-- Cyber Ops AI Frontier: the 4 missing CourseContent rows for product
-- "cyberstart" (weeks 17-20). The original cyber_ops_content migration only
-- created weeks 1-16; the AI Frontier track (modules 17-20) shipped later
-- without content rows, so Progress writes FK onto nothing and completing
-- those modules could never persist. Same idempotent data-migration pattern:
-- ON CONFLICT on (productId, week) does nothing, so re-running is harmless.

INSERT INTO "CourseContent" ("id", "productId", "week", "title", "description", "order", "createdAt", "updatedAt")
SELECT w."id", p."id", w."week", w."title", w."description", w."week", now(), now()
FROM "Product" p
CROSS JOIN (VALUES
  ('cc_cyberops_w17', 17, 'Prompt Injection',                'The AI cousin of injection: make a scripted assistant ignore its rules, leak its system prompt, and obey poisoned content.'),
  ('cc_cyberops_w18', 18, 'Cloud & API Security',            'BOLA, public buckets and leaked keys against a sandboxed API and object store.'),
  ('cc_cyberops_w19', 19, 'Agentic AI Under Attack',         'Hijack an AI agent that has tools: indirect injection, the confused deputy, and the lethal trifecta.'),
  ('cc_cyberops_w20', 20, 'Deepfakes & the AI Arms Race',    'Spot and defeat synthetic voice and video fraud: verify out-of-band, never with your eyes alone.')
) AS w("id", "week", "title", "description")
WHERE p."slug" = 'cyberstart'
ON CONFLICT ("productId", "week") DO NOTHING;

-- Keep the cached week count on the Product row in lock-step with the rows
-- now present (matches the original content migration's final step).
UPDATE "Product" p
SET "weeksCount" = (SELECT COUNT(*) FROM "CourseContent" c WHERE c."productId" = p."id"),
    "weeks" = (SELECT COUNT(*) FROM "CourseContent" c WHERE c."productId" = p."id"),
    "updatedAt" = now()
WHERE p."slug" = 'cyberstart';
