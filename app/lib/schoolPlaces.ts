import { prisma } from "@/app/lib/prisma";

/**
 * Places: what a school bought, what it has spent, and on which course.
 *
 * A school buys places course-blind. Adding a pupil spends one, and the
 * course comes from the class that pupil joins. A place belongs to the
 * child, not to the course, so moving a child up to the next course next
 * September re-points their existing place rather than costing another.
 *
 * THE RULE THAT MAKES THIS A LEDGER RATHER THAN A COUNT: a place spent is
 * spent. Before this file, used places were counted live as "pupils sitting
 * in classes that are not archived", which meant removing a pupil handed the
 * place back and archiving a class every July handed back the whole class.
 * One permanent row per redemption fixes that, and is also the only record
 * that the place was ever spent once the pupil has gone.
 *
 * The single exception is `creditedBackAt`, set by staff when a school has
 * genuinely lost a place to a mistake. It corrects the count without
 * deleting the row, so the correction has a trail and an author.
 */

/**
 * The courses a school can put a class on, youngest first.
 *
 * Deliberately a fixed list rather than "every ACTIVE Product": the catalogue
 * also holds the corporate courses, and a school picking AI Cleared for a
 * class of nine year olds is not a thing we want to be possible.
 */
export const SCHOOL_COURSE_SLUGS = [
  "cyber-heroes",
  "cyberexplorers",
  "cyberstart",
  "cyberstart-pro",
] as const;

export interface SchoolCourse {
  id: string;
  slug: string;
  name: string;
  ageRange: string;
  weeksCount: number;
}

/**
 * The four courses, for the picker a teacher sees when making a class.
 *
 * Age ranges come back so the picker can show them, but nothing here
 * enforces them: year-group naming differs too much between countries for an
 * age rule to be right everywhere, and a SEN group or a catch-up cohort is a
 * legitimate reason to choose a course that does not match the year.
 */
export async function listSchoolCourses(): Promise<SchoolCourse[]> {
  const rows = await prisma.product.findMany({
    where: { slug: { in: [...SCHOOL_COURSE_SLUGS] } },
    select: { id: true, slug: true, name: true, ageRange: true, weeksCount: true, ageMin: true },
    orderBy: { ageMin: "asc" },
  });
  return rows.map(({ ageMin: _ageMin, ...rest }) => rest);
}

/** True if this product is one a school may put a class on. */
export async function isSchoolCourse(productId: string): Promise<boolean> {
  if (!productId) return false;
  const row = await prisma.product.findFirst({
    where: { id: productId, slug: { in: [...SCHOOL_COURSE_SLUGS] } },
    select: { id: true },
  });
  return row !== null;
}

/**
 * How many places this school has spent.
 *
 * Counts ledger rows, not pupils. A row that staff credited back does not
 * count; every other row does, including rows whose pupil has since left.
 */
export async function placesUsed(orgId: string): Promise<number> {
  return prisma.placeRedemption.count({ where: { orgId, creditedBackAt: null } });
}

export interface CourseUsage {
  slug: string;
  name: string;
  pupils: number;
  classes: number;
}

export interface PlacesSummary {
  bought: number;
  redeemed: number;
  available: number;
  /** Live classes, by course, youngest course first. */
  byCourse: CourseUsage[];
  /** Places held by pupils in classes archived at the end of a year. */
  inArchivedClasses: number;
  /** Places spent on pupils who have since left. Not coming back. */
  leftTheSchool: number;
}

/**
 * The three numbers a head logs in for, plus where the places went.
 *
 * `redeemed` is the ledger. The breakdown underneath it is computed live
 * from where the pupils actually sit today, which is why a place can move
 * between courses without the ledger changing. The three buckets add up:
 * redeemed = (pupils across byCourse) + inArchivedClasses + leftTheSchool.
 */
export async function placesSummary(orgId: string): Promise<PlacesSummary> {
  const [org, redeemed, classes, archivedPupils, leftTheSchool] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: orgId }, select: { seatsPurchased: true } }),
    placesUsed(orgId),
    prisma.class.findMany({
      where: { orgId, archivedAt: null },
      select: {
        product: { select: { slug: true, name: true, ageMin: true } },
        _count: { select: { pupils: true } },
      },
    }),
    prisma.childProfile.count({ where: { class: { orgId, archivedAt: { not: null } } } }),
    prisma.placeRedemption.count({
      where: { orgId, creditedBackAt: null, childProfileId: null },
    }),
  ]);

  const bought = org?.seatsPurchased ?? 0;

  /* Every school course gets a row, including the ones with no classes yet:
     a head deciding whether to run Explorers next year should see it sitting
     there at zero rather than wonder whether it is included at all. */
  const order = new Map<string, number>();
  const byCourse = new Map<string, CourseUsage>();
  for (const k of classes) {
    const key = k.product.slug;
    order.set(key, k.product.ageMin);
    const row = byCourse.get(key) ?? { slug: key, name: k.product.name, pupils: 0, classes: 0 };
    row.pupils += k._count.pupils;
    row.classes += 1;
    byCourse.set(key, row);
  }
  for (const c of await listSchoolCourses()) {
    if (!byCourse.has(c.slug)) {
      byCourse.set(c.slug, { slug: c.slug, name: c.name, pupils: 0, classes: 0 });
      order.set(c.slug, SCHOOL_COURSE_SLUGS.indexOf(c.slug as (typeof SCHOOL_COURSE_SLUGS)[number]));
    }
  }

  return {
    bought,
    redeemed,
    available: Math.max(0, bought - redeemed),
    byCourse: [...byCourse.values()].sort(
      (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0),
    ),
    inArchivedClasses: archivedPupils,
    leftTheSchool,
  };
}

/**
 * Hand a place back to the pool. Staff only, for a genuine mistake.
 *
 * The usual one is a teacher deleting a misspelled pupil and re-adding them,
 * which spends two places for one child. The row is kept and stamped rather
 * than deleted, so the school's history still shows what happened.
 *
 * Idempotent: crediting an already-credited place back changes nothing.
 */
export async function creditPlaceBack(args: {
  orgId: string;
  redemptionId: string;
  staffUserId: string;
}): Promise<boolean> {
  const done = await prisma.placeRedemption.updateMany({
    where: { id: args.redemptionId, orgId: args.orgId, creditedBackAt: null },
    data: { creditedBackAt: new Date(), creditedBy: args.staffUserId },
  });
  return done.count === 1;
}

/**
 * The places a school has spent on pupils who have since gone, newest first.
 *
 * This is what staff work from when crediting one back: there is nothing
 * left to identify the child, which is deliberate, so the only thing to go
 * on is when it happened.
 */
export async function listCreditablePlaces(orgId: string, take = 20) {
  return prisma.placeRedemption.findMany({
    where: { orgId, creditedBackAt: null, childProfileId: null },
    orderBy: { redeemedAt: "desc" },
    take,
    select: { id: true, redeemedAt: true },
  });
}
