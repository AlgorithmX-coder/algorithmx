-- AI Fluent, phase 1: the second corporate course on the same platform.
-- Schema: a course on every seat (one seat per person per course), Fluent
-- seat counts on the firm, Fluent verdicts on progress and attempts, and
-- the playbook table (the one place the platform keeps text a learner
-- wrote). Data: the ai-fluent product row and two Fluent seats on each
-- test firm. Every data statement is idempotent.

-- CreateEnum
CREATE TYPE "CourseKey" AS ENUM ('AI_CLEARED', 'AI_FLUENT');

-- CreateEnum
CREATE TYPE "FluentVerdict" AS ENUM ('FLUENT', 'NEARLY', 'NOT_YET');

-- DropIndex
DROP INDEX "Seat_orgId_email_key";

-- AlterTable
ALTER TABLE "ModuleProgress" ADD COLUMN     "bestFluent" "FluentVerdict";

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "fluentSeatsPurchased" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SandboxAttempt" ADD COLUMN     "fluentVerdict" "FluentVerdict",
ADD COLUMN     "rubricScore" INTEGER;

-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "course" "CourseKey" NOT NULL DEFAULT 'AI_CLEARED';

-- CreateTable
CREATE TABLE "PlaybookEntry" (
    "id" TEXT NOT NULL,
    "enrolmentId" TEXT NOT NULL,
    "module" INTEGER NOT NULL,
    "workflow" TEXT NOT NULL,
    "tool" "SandboxTool" NOT NULL,
    "prompt" TEXT NOT NULL,
    "whenToUse" TEXT,
    "check" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaybookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaybookEntry_enrolmentId_idx" ON "PlaybookEntry"("enrolmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_orgId_email_course_key" ON "Seat"("orgId", "email", "course");

-- AddForeignKey
ALTER TABLE "PlaybookEntry" ADD CONSTRAINT "PlaybookEntry_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "Enrolment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The product row. Priced at the Team rate per seat; Firm and Enterprise
-- rates are quoted on /corporate. Excluded from the consumer hub by slug.
INSERT INTO "Product" ("id", "slug", "name", "ageMin", "ageMax", "priceGBP", "weeks", "status", "emoji", "ageRange", "duration", "weeksCount", "createdAt", "updatedAt")
VALUES ('prod_ai_fluent_0000000001', 'ai-fluent', 'AI Fluent', 18, 99, 5900, 0, 'ACTIVE'::"ProductStatus", '✨', 'Working adults', 'About three hours', 0, now(), now())
ON CONFLICT ("slug") DO NOTHING;

-- Two Fluent seats on each test firm, for the build's own runs. Claiming
-- one needs a valid AI Cleared certificate on the same login.
INSERT INTO "Seat" ("id", "orgId", "email", "inviteToken", "team", "role", "course", "invitedAt")
SELECT s."id", o."id", s."email", s."token", s."team", 'LEARNER'::"OrgRole", 'AI_FLUENT'::"CourseKey", now()
FROM "Organisation" o
CROSS JOIN (VALUES
  ('seat_mf_flu1_0000000001', 'fluent1.tester@marlowfenwick.example', 'mf-flu-w7pk3nq2vd8r', 'Finance'),
  ('seat_mf_flu2_0000000001', 'fluent2.tester@marlowfenwick.example', 'mf-flu-j4tm9xc6bs2h', NULL)
) AS s("id", "email", "token", "team")
WHERE o."slug" = 'marlow-fenwick'
ON CONFLICT ("orgId", "email", "course") DO NOTHING;

INSERT INTO "Seat" ("id", "orgId", "email", "inviteToken", "team", "role", "course", "invitedAt")
SELECT s."id", o."id", s."email", s."token", s."team", 'LEARNER'::"OrgRole", 'AI_FLUENT'::"CourseKey", now()
FROM "Organisation" o
CROSS JOIN (VALUES
  ('seat_hd_flu1_0000000001', 'fluent1.tester@hollinsdacre.example', 'hd-flu-q8vn2kd5mw3t', 'Accounts'),
  ('seat_hd_flu2_0000000001', 'fluent2.tester@hollinsdacre.example', 'hd-flu-c6ph4sr9zx7b', NULL)
) AS s("id", "email", "token", "team")
WHERE o."slug" = 'hollins-dacre'
ON CONFLICT ("orgId", "email", "course") DO NOTHING;

UPDATE "Organisation" SET "fluentSeatsPurchased" = 5 WHERE "slug" IN ('marlow-fenwick', 'hollins-dacre') AND "fluentSeatsPurchased" = 0;
