-- Organisations that are not schools.
--
-- A youth club, a council, a charity, a scout group, a home-ed co-op or a
-- training provider buys places for young people and runs the same four
-- courses a school does. They share every piece of machinery: classes,
-- pupils, picture sign-in, the places ledger. What differs is how they are
-- sold to and the words staff use, so this is one flag on the existing
-- profile rather than a second set of tables.
--
-- SAFE ON EXISTING DATA. One new column with a default, so every row that
-- already exists becomes a SCHOOL, which is what they all are.

-- CreateEnum
CREATE TYPE "LearnerOrgKind" AS ENUM ('SCHOOL', 'ORGANISATION');

-- AlterTable
ALTER TABLE "SchoolProfile" ADD COLUMN "kind" "LearnerOrgKind" NOT NULL DEFAULT 'SCHOOL';
