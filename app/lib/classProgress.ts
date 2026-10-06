import { prisma } from "@/app/lib/prisma";

/**
 * How a class is getting on.
 *
 * THE OWNERSHIP RULE IS THE WHOLE POINT OF THIS FILE. `progressService` has
 * exactly one: the parent owns the child. A teacher reading a pupil's
 * progress fails that outright, so this is the second rule, and it is the
 * only thing standing between one school and another school's children.
 *
 * It is written one way and only one way: every query filters on
 * `class: { orgId }`, in the same query rather than after it, with the orgId
 * coming from the signed-in teacher's own membership. There is no code path
 * here that takes a class id and trusts it. A class id from another school
 * returns nothing, which is also the truth from this teacher's point of view.
 *
 * It is READ ONLY. A teacher can see how a child is doing and cannot change
 * it. Writing progress stays where it was, behind the parent-owns-child rule,
 * because a pupil owns their own profile and writes their own progress.
 */

const PRODUCT_SLUG = "cyber-heroes";

export type PupilState = "not_started" | "in_progress" | "done";

export interface PupilProgress {
  id: string;
  name: string;
  /** Null until the child has chosen their pictures. */
  signedIn: boolean;
  weeksComplete: number;
  totalStars: number;
  /** One entry per week of the course, in order. */
  weeks: { week: number; state: PupilState; stars: number }[];
  /** The furthest week they have touched, for the "where are they" column. */
  currentWeek: number | null;
  lastSeen: Date | null;
}

export interface ClassProgress {
  className: string;
  yearGroup: number | null;
  code: string;
  weeksCount: number;
  pupils: PupilProgress[];
  /** The three numbers a teacher actually scans for. */
  notStarted: number;
  inProgress: number;
  finished: number;
}

/**
 * Everything a teacher needs about one class, or null if that class is not
 * theirs. `orgId` must come from the caller's own membership, never from the
 * request.
 */
export async function getClassProgress(orgId: string, classId: string): Promise<ClassProgress | null> {
  const klass = await prisma.class.findFirst({
    /* scoped in the query, not checked after it */
    where: { id: classId, orgId, archivedAt: null },
    select: {
      name: true, yearGroup: true, code: true,
      pupils: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, user: { select: { hashedPassword: true } } },
      },
    },
  });
  if (!klass) return null;

  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    select: { weeksCount: true },
  });
  const weeksCount = product?.weeksCount ?? 20;

  const ids = klass.pupils.map((p) => p.id);
  const rows = ids.length
    ? await prisma.progress.findMany({
        /* scoped again through the relation, so even a stale id list cannot
           reach another school's rows */
        where: {
          childProfileId: { in: ids },
          childProfile: { class: { orgId } },
          product: { slug: PRODUCT_SLUG },
        },
        select: { childProfileId: true, week: true, stars: true, completedAt: true, updatedAt: true },
      })
    : [];

  const byChild = new Map<string, Map<number, { stars: number; completedAt: Date | null; updatedAt: Date }>>();
  for (const id of ids) byChild.set(id, new Map());
  for (const r of rows) {
    byChild.get(r.childProfileId)?.set(r.week, {
      stars: r.stars, completedAt: r.completedAt, updatedAt: r.updatedAt,
    });
  }

  const pupils: PupilProgress[] = klass.pupils.map((p) => {
    const mine = byChild.get(p.id) ?? new Map();
    const weeks: PupilProgress["weeks"] = [];
    let weeksComplete = 0;
    let totalStars = 0;
    let currentWeek: number | null = null;
    let lastSeen: Date | null = null;

    for (let w = 1; w <= weeksCount; w++) {
      const row = mine.get(w);
      const state: PupilState = !row ? "not_started" : row.completedAt ? "done" : "in_progress";
      if (state === "done") weeksComplete++;
      if (row) {
        totalStars += row.stars;
        currentWeek = w;
        if (!lastSeen || row.updatedAt > lastSeen) lastSeen = row.updatedAt;
      }
      weeks.push({ week: w, state, stars: row?.stars ?? 0 });
    }

    return {
      id: p.id,
      name: p.name,
      signedIn: Boolean(p.user.hashedPassword),
      weeksComplete,
      totalStars,
      weeks,
      currentWeek,
      lastSeen,
    };
  });

  /* Sorted by who needs the teacher, not alphabetically. A register is in
     name order; this is a list of who to go and stand next to. Never started
     first, then stuck part-way, then finished, and inside each group the
     child who has done least. */
  const rank = (p: PupilProgress) =>
    !p.signedIn ? 0 : p.weeksComplete === 0 && p.currentWeek === null ? 1 : p.weeksComplete < weeksCount ? 2 : 3;
  pupils.sort((a, b) => rank(a) - rank(b) || a.weeksComplete - b.weeksComplete || a.name.localeCompare(b.name));

  return {
    className: klass.name,
    yearGroup: klass.yearGroup,
    code: klass.code,
    weeksCount,
    pupils,
    notStarted: pupils.filter((p) => p.currentWeek === null).length,
    inProgress: pupils.filter((p) => p.currentWeek !== null && p.weeksComplete < weeksCount).length,
    finished: pupils.filter((p) => p.weeksComplete >= weeksCount).length,
  };
}
