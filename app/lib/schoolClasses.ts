import { randomInt } from "crypto";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Classes and pupils.
 *
 * A pupil is a `User` owning one `ChildProfile`, created by their teacher.
 * Nothing about that is new machinery: it means `/cyberhq`, `/dashboard`,
 * `/lesson` and every write through `progressService` work for a pupil
 * exactly as they already work for a child on a family account. A second
 * kind of identity would have meant a second code path through all of it,
 * forever.
 *
 * What we store about somebody else's child is deliberately almost nothing:
 * a first name, a colour they pick, and which class they are in. No surname,
 * no date of birth, no email, no contact details. The class carries a year
 * group, which is all the age signal the course needs.
 */

/* Unambiguous alphabet: no O/0, no I/1/l, no S/5. A seven year old types
   this off a card, and every pair we leave in is a support call. */
const ALPHABET = "ABCDEFGHJKMNPQRTUVWXYZ2346789";

/** `/schools/login` validates `^[A-Z0-9]{2,8}(-[A-Z0-9]{1,4})?$`, so the code
 *  is shaped to match the form that was written before any of this existed. */
function newCode(): string {
  const pick = (n: number) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${pick(4)}-${pick(3)}`;
}

export type ClassFailure =
  | "not_a_school"
  | "seats_full"
  | "bad_name"
  | "bad_year"
  | "class_not_found"
  | "bad_pupil_name"
  | "no_pupils";

export interface SchoolContext {
  orgId: string;
  orgName: string;
  seatsPurchased: number;
  seatsUsed: number;
}

/**
 * The school a teacher belongs to, with its seat count.
 *
 * Requires a `SchoolProfile`, which is what finally separates a school from a
 * law firm. `app/lib/schoolAccess.ts` could not make that distinction and
 * said so in a comment; this is the fix that comment promised.
 */
export async function getSchoolContext(userId: string): Promise<SchoolContext | null> {
  if (!userId) return null;
  const member = await prisma.orgMember.findFirst({
    where: { userId, role: { in: ["ADMIN", "MANAGER"] }, org: { school: { isNot: null } } },
    select: { org: { select: { id: true, name: true, seatsPurchased: true } } },
  });
  if (!member) return null;
  const seatsUsed = await prisma.childProfile.count({
    where: { class: { orgId: member.org.id, archivedAt: null } },
  });
  return {
    orgId: member.org.id,
    orgName: member.org.name,
    seatsPurchased: member.org.seatsPurchased,
    seatsUsed,
  };
}

/** Every class at the school, with how many pupils are in each. */
export async function listClasses(orgId: string) {
  return prisma.class.findMany({
    where: { orgId, archivedAt: null },
    orderBy: [{ yearGroup: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, yearGroup: true, code: true, createdAt: true,
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { pupils: true } },
    },
  });
}

export async function createClass(args: {
  orgId: string;
  teacherId: string;
  name: string;
  yearGroup?: number | null;
}): Promise<{ ok: true; id: string; code: string } | { ok: false; error: ClassFailure }> {
  const name = args.name.trim();
  if (!name || name.length > 40) return { ok: false, error: "bad_name" };
  const year = args.yearGroup ?? null;
  if (year !== null && (!Number.isInteger(year) || year < 1 || year > 13)) {
    return { ok: false, error: "bad_year" };
  }

  /* A unique code on the first try almost always; the loop is for the day it
     is not, because a collision would otherwise surface as a raw constraint
     error in a teacher's face. */
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = newCode();
    const taken = await prisma.class.findUnique({ where: { code }, select: { id: true } });
    if (taken) continue;
    const created = await prisma.class.create({
      data: { orgId: args.orgId, teacherId: args.teacherId, name, yearGroup: year, code },
      select: { id: true, code: true },
    });
    return { ok: true, id: created.id, code: created.code };
  }
  throw new Error("could not find a free class code in 8 attempts");
}

/** The colours a child can pick, matching the family onboarding. */
const COLOURS = ["cyan", "violet", "lime", "amber", "rose", "teal"] as const;

/**
 * Add pupils to a class, by first name.
 *
 * Each one gets an account they own. The address is synthetic and on a
 * reserved domain that can never receive mail, so a child's record can never
 * be emailed by accident, and it carries no name and no school: a leaked
 * address says nothing about the child it belongs to.
 *
 * The picture password is set later, by the child, on first sign-in. Until
 * then `hashedPassword` is null, and the credentials provider already refuses
 * a user without one, so a pupil account that has never been set up cannot be
 * signed into at all. No sentinel value of our own, which would only be one
 * more thing that has to stay in step with the provider.
 */
export async function addPupils(args: {
  orgId: string;
  classId: string;
  firstNames: readonly string[];
}): Promise<{ ok: true; added: number } | { ok: false; error: ClassFailure; detail?: string }> {
  const klass = await prisma.class.findFirst({
    where: { id: args.classId, orgId: args.orgId, archivedAt: null },
    select: { id: true },
  });
  if (!klass) return { ok: false, error: "class_not_found" };

  const names = args.firstNames.map((n) => n.trim()).filter(Boolean);
  if (!names.length) return { ok: false, error: "no_pupils" };
  const tooLong = names.find((n) => n.length > 30);
  if (tooLong) return { ok: false, error: "bad_pupil_name", detail: tooLong };

  /* The seat cap, enforced. `seatsPurchased` has existed since AI Cleared and
     has never been checked anywhere: a firm can invite more people than it
     bought. A school should not be able to. */
  const org = await prisma.organisation.findUnique({
    where: { id: args.orgId },
    select: { seatsPurchased: true },
  });
  if (!org) return { ok: false, error: "not_a_school" };
  const used = await prisma.childProfile.count({
    where: { class: { orgId: args.orgId, archivedAt: null } },
  });
  if (used + names.length > org.seatsPurchased) {
    return { ok: false, error: "seats_full", detail: String(org.seatsPurchased - used) };
  }

  let added = 0;
  for (const firstName of names) {
    const tag = randomInt(2 ** 48).toString(36) + Date.now().toString(36);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: firstName,
          email: `pupil.${tag}@pupils.algorithmx.invalid`,
          role: "pupil",
        },
        select: { id: true },
      });
      await tx.childProfile.create({
        data: {
          userId: user.id,
          name: firstName,
          favouriteColour: COLOURS[randomInt(COLOURS.length)],
          classId: args.classId,
        },
      });
    });
    added++;
  }
  return { ok: true, added };
}

/** Everyone in a class, for the login card sheet and the teacher's list. */
export async function listPupils(orgId: string, classId: string) {
  return prisma.childProfile.findMany({
    where: { classId, class: { orgId } },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, favouriteColour: true, createdAt: true,
      user: { select: { id: true, hashedPassword: true } },
    },
  });
}

/** Removing a pupil removes the account and, with it, the progress. A school
 *  that removes a child is saying that child has left. */
export async function removePupil(orgId: string, childProfileId: string): Promise<boolean> {
  const child = await prisma.childProfile.findFirst({
    where: { id: childProfileId, class: { orgId } },
    select: { userId: true },
  });
  if (!child) return false;
  await prisma.user.delete({ where: { id: child.userId } });
  return true;
}

/** Hash a picture sequence the same way a password is hashed, so a pupil can
 *  use the credentials provider that already exists. */
export async function hashPictureSequence(sequence: readonly string[]): Promise<string> {
  return bcrypt.hash(sequence.join("."), 10);
}
