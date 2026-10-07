-- Add CYBER_PRO to the CourseKey enum so the Cyber Pro AI tutor can label
-- its model calls against the per-person daily allowance (ModelCall.course).
-- Purely additive: one new enum value, no table or column changes. On
-- PostgreSQL 12+ ALTER TYPE ... ADD VALUE is safe here because the new
-- value is not used within this migration.
ALTER TYPE "CourseKey" ADD VALUE IF NOT EXISTS 'CYBER_PRO';
