-- The school spine: a marker that an organisation is a school, a class to
-- hang pupils on, and the two changes to ChildProfile that let one child row
-- belong to a class instead of a family.
--
-- Written by hand rather than by `prisma migrate dev`, because the only
-- database reachable from a dev machine here is production and migrate dev
-- resets whatever it points at. Column types and constraint names follow the
-- shapes Prisma generated for Seat, FirmProfile and PackShareLink.
--
-- SAFE ON EXISTING DATA. Both ChildProfile changes are widening: a required
-- column becomes nullable (no existing row violates that) and a nullable
-- column is added. No existing family profile is touched, and nothing is
-- dropped or renamed.

-- AlterTable: a school never hands us a child's birthday, so it stops being
-- required. Every existing family row keeps the date it already has.
ALTER TABLE "ChildProfile" ALTER COLUMN "dateOfBirth" DROP NOT NULL;

-- AlterTable: which class a pupil is in. Null for a child on a family account.
ALTER TABLE "ChildProfile" ADD COLUMN "classId" TEXT;

-- CreateTable
CREATE TABLE "SchoolProfile" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "safeguardingContact" TEXT,
    "childLineNumber" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearGroup" INTEGER,
    "code" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolProfile_orgId_key" ON "SchoolProfile"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");

-- CreateIndex
CREATE INDEX "Class_orgId_idx" ON "Class"("orgId");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "ChildProfile_classId_idx" ON "ChildProfile"("classId");

-- AddForeignKey
ALTER TABLE "SchoolProfile" ADD CONSTRAINT "SchoolProfile_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SetNull, so archiving or removing a class never deletes a
-- child's progress. The profile survives with no class.
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
