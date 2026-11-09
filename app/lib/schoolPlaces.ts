import { prisma } from "@/app/lib/prisma";
import type { LearnerOrgKind } from "@prisma/client";

/**
 * Places: what a school bought, what it has spent, and on which course.
 *
 * A school buys places course-blind. Adding a pupil spends one, and the
 * course comes from the class that pupil joins.
 *
 * WHAT A PLACE BUYS (owner, 2026-11-09): one child on ONE course. It
 * follows the child, so moving them between classes of the course they are
 * already on is free, and so is a whole year group shuffling form groups.
 * Starting a SECOND course spends a second place. That settles a
 * disagreement between two earlier rulings, one of which said a place was
 * the child outright and one of which said it was the child on one course;
 * this is the second, with the "follows the child" part of the first kept.
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
 * The courses a learner organisation can put a class on, youngest first.
 *
 * Deliberately a fixed list rather than "every ACTIVE Product": the catalogue
 * also holds the corporate courses, and a school picking AI Cleared for a
 * class of nine year olds is not a thing we want to be possible.
 *
 * CYBER PRO DEPENDS ON WHO IS ASKING (owner, 2026-11-09): *"for schools,
 * remove CyberPro because we're not doing pro. Pro is only for
 * organizations."*
 *
 * A SCHOOL gets three. Pro is the 18+ course and a school is not selling it,
 * and it sat in a picker whose year field stops at 13.
 *
 * AN ORGANISATION gets four. A training provider or an adult education
 * project is exactly who Pro is for. Note that a Pro group's progress reads
 * differently from the others, because Pro keeps its progress in its own
 * table by topic rather than by week: see classProgress.ts, which shows a Pro
 * group topics and modules instead of a row of weeks rather than showing
 * everybody as "not started" for ever, which is what it used to do and the
 * reason Pro was pulled from both lists for a few hours.
 *
 * Any class already made on a course that has since left its list keeps
 * working: nothing here deletes one, COURSE_NAME below still names it, and
 * movePupil can still move a learner out of it. It only stops being
 * choosable.
 */
export const SCHOOL_COURSE_SLUGS = [
  "cyber-heroes",
  "cyberexplorers",
  "cyberstart",
] as const;

export const ORGANISATION_COURSE_SLUGS = [
  ...SCHOOL_COURSE_SLUGS,
  "cyberstart-pro",
] as const;

/** The courses this kind of organisation may choose from. */
export function courseSlugsFor(kind: LearnerOrgKind): readonly string[] {
  return kind === "ORGANISATION" ? ORGANISATION_COURSE_SLUGS : SCHOOL_COURSE_SLUGS;
}

/**
 * What each course is called, which is not always what `Product.name` says.
 *
 * The catalogue has "Cyber Heroes Academy" for `cyber-heroes`, while every
 * public page, the nav and the marketing all say "Cyber Heroes". The odd one
 * out was showing up in the teacher's course picker. The slugs are stranger
 * still for historical reasons (`cyberstart` is Cyber Ops), so neither the
 * slug nor the stored name can be put in front of a teacher as it stands.
 *
 * Cyber Pro stays in this map although it has left SCHOOL_COURSE_SLUGS: a
 * class made before it was withdrawn still has to be named properly on the
 * screens that list it.
 */
const COURSE_NAME: Record<string, string> = {
  "cyber-heroes": "Cyber Heroes",
  cyberexplorers: "Cyber Explorers",
  cyberstart: "Cyber Ops",
  "cyberstart-pro": "Cyber Pro",
};

/** The name to show a teacher, falling back to the catalogue's own. */
export function courseName(slug: string, fallback: string): string {
  return COURSE_NAME[slug] ?? fallback;
}

export interface SchoolCourse {
  id: string;
  slug: string;
  name: string;
  ageRange: string;
  weeksCount: number;
}

/**
 * The courses for the picker a teacher sees when making a class.
 *
 * Age ranges come back so the picker can show them, but nothing here
 * enforces them: year-group naming differs too much between countries for an
 * age rule to be right everywhere, and a SEN group or a catch-up cohort is a
 * legitimate reason to choose a course that does not match the year.
 */
export async function listSchoolCourses(kind: LearnerOrgKind = "SCHOOL"): Promise<SchoolCourse[]> {
  const rows = await prisma.product.findMany({
    where: { slug: { in: [...courseSlugsFor(kind)] } },
    select: { id: true, slug: true, name: true, ageRange: true, weeksCount: true, ageMin: true },
    orderBy: { ageMin: "asc" },
  });
  return rows.map(({ ageMin: _ageMin, ...rest }) => ({ ...rest, name: courseName(rest.slug, rest.name) }));
}

/**
 * True if this product is one this kind of organisation may put a class on.
 *
 * `kind` defaults to SCHOOL, the stricter of the two, so a caller that
 * forgets to pass it refuses Pro rather than allowing it. A gate that fails
 * open is worth more care than one that fails shut.
 */
export async function isSchoolCourse(
  productId: string,
  kind: LearnerOrgKind = "SCHOOL",
): Promise<boolean> {
  if (!productId) return false;
  const row = await prisma.product.findFirst({
    where: { id: productId, slug: { in: [...courseSlugsFor(kind)] } },
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
  /**
   * Places SPENT on this course by pupils still at the school. This is the
   * money figure, and since a place became good for one course it is no
   * longer the same as `pupils`: a child who moved up from Cyber Heroes to
   * Cyber Explorers counts one place against each, while sitting in one
   * class.
   */
  places: number;
  /** Pupils sitting in live classes on it today. */
  pupils: number;
  classes: number;
}

export interface PlacesSummary {
  bought: number;
  redeemed: number;
  available: number;
  /** Where the places went, by course, youngest course first. */
  byCourse: CourseUsage[];
  /** Places held by pupils in classes archived at the end of a year. */
  inArchivedClasses: number;
  /** Places spent on pupils who have since left. Not coming back. */
  leftTheSchool: number;
  /**
   * Places spent before a place recorded which course it was for. Zero on
   * any school created after 2026-11-10, and shown only when it is not,
   * because a figure that cannot be explained is worse than no figure.
   */
  courseNotRecorded: number;
}

/**
 * The three numbers a head logs in for, plus where the places went.
 *
 * EVERY FIGURE BELOW COMES FROM THE LEDGER, which it did not used to. The
 * per-course breakdown was a live count of pupils sitting in classes, and
 * the three buckets were documented as adding up to `redeemed`. That stopped
 * being true the moment a place became good for one course: a child who has
 * moved up a course holds two places while sitting in one class, so counting
 * pupils undercounts the money. Each bucket is now a count of ledger rows,
 * which makes the partition real again:
 *
 *   redeemed = byCourse places + inArchivedClasses + leftTheSchool
 *            + courseNotRecorded
 *
 * `pupils` and `classes` stay on each row as context, because "28 places
 * spent on Cyber Heroes, 2 classes running it today" is the pair a head
 * actually wants.
 */
export async function placesSummary(
  orgId: string,
  /* Decides which courses get a zero row below. An organisation runs
     Cyber Pro as well, so leaving this out would hide it from the one
     screen a head uses to decide what to run next year. */
  kind: LearnerOrgKind = "SCHOOL",
): Promise<PlacesSummary> {
  const [org, redeemed, classes, spentByCourse, inArchivedClasses, leftTheSchool] =
    await Promise.all([
      prisma.organisation.findUnique({ where: { id: orgId }, select: { seatsPurchased: true } }),
      placesUsed(orgId),
      prisma.class.findMany({
        where: { orgId, archivedAt: null },
        select: {
          product: { select: { slug: true, name: true, ageMin: true } },
          _count: { select: { pupils: true } },
        },
      }),
      /* Ledger rows for pupils who are still here and in a live class, so
         they can be tallied by the course the place was spent on.
         Deliberately a plain select tallied below rather than a groupBy: the
         row count is bounded by what the school bought, which is hundreds,
         and this is readable without knowing Prisma's aggregate types. */
      prisma.placeRedemption.findMany({
        where: { orgId, creditedBackAt: null, child: { class: { archivedAt: null } } },
        select: { productId: true },
      }),
      prisma.placeRedemption.count({
        where: { orgId, creditedBackAt: null, child: { class: { archivedAt: { not: null } } } },
      }),
      prisma.placeRedemption.count({
        where: { orgId, creditedBackAt: null, childProfileId: null },
      }),
    ]);

  const bought = org?.seatsPurchased ?? 0;

  /* Tally the ledger rows by course. */
  const spentPerProduct = new Map<string, number>();
  let courseNotRecorded = 0;
  for (const row of spentByCourse) {
    if (!row.productId) {
      courseNotRecorded++;
      continue;
    }
    spentPerProduct.set(row.productId, (spentPerProduct.get(row.productId) ?? 0) + 1);
  }

  /* Slugs for the courses the ledger mentions, read separately because the
     ledger stores an id and every screen shows a name. */
  const spentIds = [...spentPerProduct.keys()];
  const products = spentIds.length
    ? await prisma.product.findMany({
        where: { id: { in: spentIds } },
        select: { id: true, slug: true, name: true, ageMin: true },
      })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const order = new Map<string, number>();
  const byCourse = new Map<string, CourseUsage>();

  const blank = (slug: string, name: string): CourseUsage => ({
    slug,
    name: courseName(slug, name),
    places: 0,
    pupils: 0,
    classes: 0,
  });

  for (const [productId, count] of spentPerProduct) {
    const p = byId.get(productId);
    if (!p) {
      /* A place spent on a course that has since been deleted from the
         catalogue. The row survived, as it should, and the money with it. */
      courseNotRecorded += count;
      continue;
    }
    const got = byCourse.get(p.slug) ?? blank(p.slug, p.name);
    got.places += count;
    byCourse.set(p.slug, got);
    order.set(p.slug, p.ageMin);
  }

  for (const k of classes) {
    const key = k.product.slug;
    order.set(key, k.product.ageMin);
    const got = byCourse.get(key) ?? blank(key, k.product.name);
    got.pupils += k._count.pupils;
    got.classes += 1;
    byCourse.set(key, got);
  }

  /* Every school course gets a row, including the ones with nothing on them:
     a head deciding whether to run Explorers next year should see it sitting
     there at zero rather than wonder whether it is included at all. */
  for (const c of await listSchoolCourses(kind)) {
    if (!byCourse.has(c.slug)) {
      byCourse.set(c.slug, blank(c.slug, c.name));
      order.set(c.slug, courseSlugsFor(kind).indexOf(c.slug));
    }
  }

  return {
    bought,
    redeemed,
    available: Math.max(0, bought - redeemed),
    byCourse: [...byCourse.values()].sort(
      (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0),
    ),
    inArchivedClasses,
    leftTheSchool,
    courseNotRecorded,
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
