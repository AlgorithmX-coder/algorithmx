-- Cyber Secured: the one firm licence (AI Cleared + AI Fluent + Cyber
-- Awareness, one seat per person). CYBER_SECURED keys the licence seat;
-- CYBER_AWARENESS labels the new track's model calls. Purely additive.
-- The values are not used in this migration: PostgreSQL refuses a new
-- enum value in the same transaction that adds it, so the seat default
-- moves in the next migration.
ALTER TYPE "CourseKey" ADD VALUE IF NOT EXISTS 'CYBER_SECURED';
ALTER TYPE "CourseKey" ADD VALUE IF NOT EXISTS 'CYBER_AWARENESS';
