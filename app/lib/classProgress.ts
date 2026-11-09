import { prisma } from "@/app/lib/prisma";
import { courseName } from "@/app/lib/schoolPlaces";

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

/* No hardcoded product any more. A class carries the course it runs, and the
   weeks and progress are read against THAT course: a year 8 class on Cyber
   Explorers must not be scored against Cyber Heroes' twenty weeks. */

/* Cyber Pro, the one school-side course whose progress is not weeks. */
const PRO_SLUG = "cyberstart-pro";

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
  /**
   * Cyber Pro only, and the reason Pro can be offered to an organisation at
   * all. Pro does not keep progress in `Progress` by week; it keeps a row per
   * completed TOPIC in `ProProgress`, against the learner's user rather than
   * their profile. Read against the week table it looks like nothing has
   * happened, which is exactly what this screen used to show: every learner
   * in a Pro group "not started" for ever, whatever they did.
   *
   * There is no module-level figure here on purpose. A module is complete
   * when all its topics are, and the list of topics per module lives in the
   * Pro lesson manifests, which import client components and so cannot be
   * read from a server module. `modules` is therefore modules TOUCHED, which
   * is true, rather than modules finished, which would be a guess.
   */
  pro?: { topics: number; modules: number };
}

export interface ClassProgress {
  className: string;
  yearGroup: number | null;
  code: string;
  /** The course this class runs, which is what its pupils are entitled to. */
  courseName: string;
  courseSlug: string;
  weeksCount: number;
  /**
   * False for Cyber Pro, whose progress is topics rather than weeks. The
   * screen reads this to decide whether a row of week pips means anything:
   * drawn for a Pro group they would all be empty for ever.
   */
  tracksWeeks: boolean;
  pupils: PupilProgress[];
  /** Set once the year has been ended. The page goes read-only: an
   *  archived class is filtered out of both pupil sign-in gates, so its
   *  children cannot get in and its code no longer works. */
  archivedAt: Date | null;
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
    /* Scoped in the query, not checked after it. Archived classes ARE
       returned: the whole reason a class is archived rather than deleted
       is that last year's progress stays attached to something, and
       refusing to read one made that promise unkeepable. The page shows
       it read-only. */
    where: { id: classId, orgId },
    select: {
      name: true, yearGroup: true, code: true, archivedAt: true,
      product: { select: { id: true, slug: true, name: true, weeksCount: true } },
      pupils: {
        orderBy: { name: "asc" },
        /* The user id as well as the hash, because Cyber Pro keys its
           progress on the user rather than the profile. */
        select: { id: true, name: true, user: { select: { id: true, hashedPassword: true } } },
      },
    },
  });
  if (!klass) return null;

  const weeksCount = klass.product.weeksCount || 20;
  const isPro = klass.product.slug === PRO_SLUG;

  /* Cyber Pro's own progress, for an organisation running it as a group.
     Topics completed and modules touched, per learner. */
  const proByUser = new Map<string, { topics: number; modules: Set<string>; last: Date | null }>();
  if (isPro) {
    const userIds = klass.pupils.map((p) => p.user.id);
    const proRows = userIds.length
      ? await prisma.proProgress.findMany({
          where: { userId: { in: userIds } },
          select: { userId: true, moduleId: true, completedAt: true },
        })
      : [];
    for (const r of proRows) {
      const got = proByUser.get(r.userId) ?? { topics: 0, modules: new Set<string>(), last: null };
      got.topics += 1;
      got.modules.add(r.moduleId);
      if (!got.last || r.completedAt > got.last) got.last = r.completedAt;
      proByUser.set(r.userId, got);
    }
  }

  const ids = klass.pupils.map((p) => p.id);
  const rows = ids.length
    ? await prisma.progress.findMany({
        /* scoped again through the relation, so even a stale id list cannot
           reach another school's rows */
        where: {
          childProfileId: { in: ids },
          childProfile: { class: { orgId } },
          productId: klass.product.id,
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

    const minePro = isPro ? proByUser.get(p.user.id) : undefined;

    return {
      id: p.id,
      name: p.name,
      signedIn: Boolean(p.user.hashedPassword),
      weeksComplete,
      totalStars,
      /* No pips for a Pro group: they would all be empty for ever, because
         Pro writes nothing to the week table. */
      weeks: isPro ? [] : weeks,
      currentWeek,
      lastSeen: isPro ? minePro?.last ?? null : lastSeen,
      ...(isPro
        ? { pro: { topics: minePro?.topics ?? 0, modules: minePro?.modules.size ?? 0 } }
        : {}),
    };
  });

  /* "Started" and "finished" mean different things on Cyber Pro, so they are
     asked rather than assumed. Read the week fields on a Pro group and every
     learner looks untouched, which is the bug this whole branch exists to
     stop. Finishing cannot be known for Pro at all, because that needs the
     topic list per module, so nobody is ever counted finished rather than
     being counted wrongly. */
  const started = (p: PupilProgress) =>
    isPro ? (p.pro?.topics ?? 0) > 0 : p.currentWeek !== null;
  const finishedAll = (p: PupilProgress) => !isPro && p.weeksComplete >= weeksCount;
  const amountDone = (p: PupilProgress) => (isPro ? p.pro?.topics ?? 0 : p.weeksComplete);

  /* Sorted by who needs the teacher, not alphabetically. A register is in
     name order; this is a list of who to go and stand next to. Never started
     first, then stuck part-way, then finished, and inside each group the
     child who has done least. */
  const rank = (p: PupilProgress) =>
    !p.signedIn ? 0 : !started(p) ? 1 : !finishedAll(p) ? 2 : 3;
  pupils.sort((a, b) => rank(a) - rank(b) || amountDone(a) - amountDone(b) || a.name.localeCompare(b.name));

  return {
    className: klass.name,
    yearGroup: klass.yearGroup,
    archivedAt: klass.archivedAt,
    code: klass.code,
    courseName: courseName(klass.product.slug, klass.product.name),
    courseSlug: klass.product.slug,
    weeksCount,
    tracksWeeks: !isPro,
    pupils,
    notStarted: pupils.filter((p) => !started(p)).length,
    inProgress: pupils.filter((p) => started(p) && !finishedAll(p)).length,
    finished: pupils.filter(finishedAll).length,
  };
}
