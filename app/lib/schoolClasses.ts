import { randomInt } from "crypto";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { isSchoolCourse, placesUsed } from "@/app/lib/schoolPlaces";
import type { LearnerOrgKind } from "@prisma/client";

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
  | "bad_course"
  | "class_not_found"
  | "bad_pupil_name"
  | "no_pupils";

export interface SchoolContext {
  orgId: string;
  orgName: string;
  /* SCHOOL or ORGANISATION. Carried so the screens under this can say
     "groups" and "young people" to a youth project rather than
     "classes" and "pupils". See app/schools/words.ts. */
  kind: LearnerOrgKind;
  seatsPurchased: number;
  seatsUsed: number;
  /* Set only while this school is on a staff-granted trial; null for a
   * licensed school. See app/lib/orgTrial.ts::trialStatus(). */
  trialExpiresAt: Date | null;
  /* Set once staff close this school's access. See orgRevoke.ts. */
  revokedAt: Date | null;
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
    select: { org: { select: { id: true, name: true, seatsPurchased: true, trialExpiresAt: true, revokedAt: true, school: { select: { kind: true } } } } },
  });
  if (!member) return null;
  /* The ledger, not a head count of pupils in live classes. A place spent is
     spent: removing a pupil does not hand it back, and archiving a class at
     the end of a year does not hand back the whole class. See schoolPlaces. */
  const seatsUsed = await placesUsed(member.org.id);
  return {
    orgId: member.org.id,
    orgName: member.org.name,
    /* The where clause above requires a SchoolProfile, so this is never
       null; SCHOOL is the safe reading if that ever changes. */
    kind: member.org.school?.kind ?? "SCHOOL",
    seatsPurchased: member.org.seatsPurchased,
    seatsUsed,
    trialExpiresAt: member.org.trialExpiresAt,
    revokedAt: member.org.revokedAt,
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
      product: { select: { slug: true, name: true } },
      _count: { select: { pupils: true } },
    },
  });
}

export async function createClass(args: {
  orgId: string;
  teacherId: string;
  name: string;
  yearGroup?: number | null;
  /** Which of the four courses this class runs. Every pupil added to it is
   *  entitled to this course, so it cannot be left unset. */
  productId: string;
}): Promise<{ ok: true; id: string; code: string } | { ok: false; error: ClassFailure }> {
  const name = args.name.trim();
  if (!name || name.length > 40) return { ok: false, error: "bad_name" };
  const year = args.yearGroup ?? null;
  if (year !== null && (!Number.isInteger(year) || year < 1 || year > 13)) {
    return { ok: false, error: "bad_year" };
  }
  /* Checked here rather than trusted from the form: this is a server action's
     input, so the picker that offered four courses is not a guarantee that
     four courses came back. */
  if (!(await isSchoolCourse(args.productId))) return { ok: false, error: "bad_course" };

  /* A unique code on the first try almost always; the loop is for the day it
     is not, because a collision would otherwise surface as a raw constraint
     error in a teacher's face. */
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = newCode();
    const taken = await prisma.class.findUnique({ where: { code }, select: { id: true } });
    if (taken) continue;
    const created = await prisma.class.create({
      data: {
        orgId: args.orgId, teacherId: args.teacherId, name, yearGroup: year, code,
        productId: args.productId,
      },
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
    select: { id: true, productId: true },
  });
  if (!klass) return { ok: false, error: "class_not_found" };

  const names = args.firstNames.map((n) => n.trim()).filter(Boolean);
  if (!names.length) return { ok: false, error: "no_pupils" };
  const tooLong = names.find((n) => n.length > 30);
  if (tooLong) return { ok: false, error: "bad_pupil_name", detail: tooLong };

  /* The place cap, enforced. `seatsPurchased` has existed since AI Cleared and
     has never been checked anywhere: a firm can invite more people than it
     bought. A school should not be able to. */
  const org = await prisma.organisation.findUnique({
    where: { id: args.orgId },
    select: { seatsPurchased: true },
  });
  if (!org) return { ok: false, error: "not_a_school" };
  const used = await placesUsed(args.orgId);
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
      const child = await tx.childProfile.create({
        data: {
          userId: user.id,
          name: firstName,
          favouriteColour: COLOURS[randomInt(COLOURS.length)],
          classId: args.classId,
        },
        select: { id: true },
      });

      /* The place, spent. One row per child, kept for good: see schoolPlaces. */
      await tx.placeRedemption.create({
        data: { orgId: args.orgId, childProfileId: child.id },
      });

      /* The course, granted. Without this a pupil signs in, lands on their
         HQ and is bounced off the first lesson they tap, because
         `/lesson/[week]` checks for an entitlement that nothing was creating.
         Written with `tx` rather than through `grantEntitlement` so the
         account, the place and the access are one atomic unit: a pupil who
         exists without a place would be free, and a pupil who exists without
         this cannot play. */
      await tx.entitlement.create({
        data: { userId: user.id, productId: klass.productId, source: "BUNDLE" },
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

/**
 * Move a pupil into another class.
 *
 * WITHOUT THIS, THE PLACES MODEL CANNOT WORK. The owner decided on
 * 2026-11-08 that a place belongs to the CHILD, so a child moving up to the
 * next course in September re-points their existing place and costs
 * nothing. There was no way to move a child, so the only route was Remove
 * and re-add: that deletes the account and the progress, and the place
 * stays spent. A school moving fifty children up a year would have burned
 * fifty places and thrown away a year of work.
 *
 * Nothing is deleted and nothing is spent. The profile keeps its id, so its
 * PlaceRedemption row, its Progress rows and its picture password all stay
 * exactly where they are.
 *
 * MOVING TO A CLASS ON ANOTHER COURSE grants the new course and LEAVES THE
 * OLD ONE in place. A child who spent a year on Cyber Heroes keeps what
 * they did; taking it away to hand them Explorers would delete work they
 * can still see in their own hub. This is the 2026-11-08 reading, which is
 * also what the rest of the code already does.
 * WARNING: the 2026-10-27 partner ruling says the opposite (one place = one
 * child on ONE course, so moving spends a second place). The two have not
 * been reconciled. This follows November.
 *
 * Any class in the SAME school is a valid destination, including another
 * teacher's, because that is exactly what September looks like.
 */
export async function movePupil(args: {
  orgId: string;
  childProfileId: string;
  toClassId: string;
}): Promise<{ ok: true; className: string } | { ok: false; error: ClassFailure }> {
  /* Both ends scoped to this school IN THE QUERY, so neither a child nor a
     class from another school can be named by a hand-made request. */
  const [child, target] = await Promise.all([
    prisma.childProfile.findFirst({
      where: { id: args.childProfileId, class: { orgId: args.orgId } },
      select: { id: true, userId: true, classId: true },
    }),
    prisma.class.findFirst({
      where: { id: args.toClassId, orgId: args.orgId, archivedAt: null },
      select: { id: true, name: true, productId: true },
    }),
  ]);
  if (!child || !target) return { ok: false, error: "class_not_found" };
  if (child.classId === target.id) return { ok: true, className: target.name };

  await prisma.$transaction(async (tx) => {
    await tx.childProfile.update({ where: { id: child.id }, data: { classId: target.id } });
    /* The new course, granted. Idempotent: a child moved back and forth
       between two courses already holds both, and the composite key makes
       the second grant a no-op rather than an error. */
    await tx.entitlement.upsert({
      where: { userId_productId: { userId: child.userId, productId: target.productId } },
      update: {},
      create: { userId: child.userId, productId: target.productId, source: "BUNDLE" },
    });
  });
  return { ok: true, className: target.name };
}

/**
 * Removing a pupil removes the account and, with it, the progress. A school
 * that removes a child is saying that child has left.
 *
 * THE PLACE IS NOT RETURNED. Deleting the user cascades to the profile, and
 * the profile's `PlaceRedemption` row survives it with a null child, because
 * that foreign key is ON DELETE SET NULL rather than CASCADE. That is the
 * commercial rule made structural: a place spent is spent. Staff can credit
 * one back for a genuine mistake (`creditPlaceBack`), which is the only way
 * a place returns to the pool.
 */
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
