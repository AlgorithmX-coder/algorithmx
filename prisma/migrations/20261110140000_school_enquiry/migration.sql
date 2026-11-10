-- Keep school enquiries.
--
-- The /schools enquiry form did exactly one thing with an enquiry: email it
-- to the schools inbox, with a console.log as the only backup. If Resend was
-- down, or the mailbox had moved, or somebody deleted the message, the lead
-- was gone and nothing anywhere knew it had ever existed. For the one form
-- on the site whose whole job is to produce customers, that is the wrong
-- order of operations.
--
-- Written by hand rather than by `prisma migrate dev`, because the only
-- database reachable from a dev machine here is production, and migrate dev
-- resets whatever it points at.
--
-- SAFE ON EXISTING DATA. One new table, nothing altered, nothing dropped,
-- no backfill: the enquiries that came in before this deploy exist only as
-- emails and server logs, and inventing rows for them would be inventing
-- data.

-- CreateTable
CREATE TABLE "SchoolEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "role" TEXT,
    "phase" TEXT NOT NULL,
    "size" TEXT,
    "message" TEXT,
    "emailed" BOOLEAN NOT NULL DEFAULT false,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: newest first is the only order this table is ever read in.
CREATE INDEX "SchoolEnquiry_createdAt_idx" ON "SchoolEnquiry"("createdAt");

-- CreateIndex: and "the ones nobody has dealt with yet" is the only filter.
CREATE INDEX "SchoolEnquiry_handledAt_idx" ON "SchoolEnquiry"("handledAt");
