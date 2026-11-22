import { prisma } from "@/app/lib/prisma";
import { placesUsed } from "@/app/lib/schoolPlaces";

/**
 * What staff can see about one school or organisation.
 *
 * Asked for by the owner (2026-11-22): "when I view the school, can we have
 * a place where we basically view the stats of whatever they're viewing?
 * For example, how many tickets have been allocated, what students, etc."
 *
 * Counts only, and that is a deliberate line rather than an oversight. The
 * safeguarding statement we publish says a named child's work is their own
 * teacher's to see, so nothing here reaches a child's name or their
 * progress: a number of pupils, never which pupils. Everything below is
 * about the licence, the classes and the shape of the account.
 */

export interface OrgStats {
  /** Places the licence was set to. */
  placesLicensed: number;
  /** Places spent from the ledger. A place follows the child, so this does
   *  not fall when a pupil is removed; that is the whole point of it. */
  placesSpent: number;
  /** Never negative: staff can lower a licence below what is already spent,
   *  and "-3 left" is not a thing anyone should be shown. */
  placesLeft: number;
  /** Places spent on pupils who have since been removed, so staff can see
   *  how much of the licence is held by children who are no longer there. */
  placesHeldByLeavers: number;
  /** Pupils sitting in classes that are still open. */
  pupilsInLiveClasses: number;
  /** Of those, how many have actually started a lesson. The gap between
   *  these two is the number that says whether a school is really using it. */
  pupilsStarted: number;
  classesLive: number;
  classesArchived: number;
  /** Which courses the school's classes are on, by name. */
  courses: string[];
  /** The most recent moment any pupil here touched a lesson. */
  lastActivity: Date | null;
}

export interface OrgStatsInput {
  placesLicensed: number;
  placesSpent: number;
  placesHeldByLeavers: number;
  liveClasses: { courseName: string; pupils: { startedAt: Date[] }[] }[];
  classesArchived: number;
}

/**
 * The arithmetic, with no database attached, so it can be tested on its own
 * and so the one rule that is easy to get wrong - what "left" means when a
 * licence is lowered below what is spent - lives somewhere it can be read.
 */
export function summariseOrg(input: OrgStatsInput): OrgStats {
  const pupils = input.liveClasses.flatMap((c) => c.pupils);
  const stamps = pupils.flatMap((p) => p.startedAt);
  const courses = [...new Set(input.liveClasses.map((c) => c.courseName))].sort();

  return {
    placesLicensed: input.placesLicensed,
    placesSpent: input.placesSpent,
    placesLeft: Math.max(0, input.placesLicensed - input.placesSpent),
    placesHeldByLeavers: input.placesHeldByLeavers,
    pupilsInLiveClasses: pupils.length,
    pupilsStarted: pupils.filter((p) => p.startedAt.length > 0).length,
    classesLive: input.liveClasses.length,
    classesArchived: input.classesArchived,
    courses,
    lastActivity: stamps.length ? new Date(Math.max(...stamps.map((d) => d.getTime()))) : null,
  };
}

export async function getOrgStats(orgId: string): Promise<OrgStats> {
  const [org, liveClasses, classesArchived, placesSpent, heldByLeavers] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: orgId }, select: { seatsPurchased: true } }),
    prisma.class.findMany({
      where: { orgId, archivedAt: null },
      select: {
        product: { select: { name: true, slug: true } },
        pupils: { select: { progress: { select: { updatedAt: true } } } },
      },
    }),
    prisma.class.count({ where: { orgId, archivedAt: { not: null } } }),
    placesUsed(orgId),
    /* A redemption whose child is gone. childProfileId is ON DELETE SET
       NULL precisely so the ledger survives the child leaving. */
    prisma.placeRedemption.count({ where: { orgId, childProfileId: null } }),
  ]);

  return summariseOrg({
    placesLicensed: org?.seatsPurchased ?? 0,
    placesSpent,
    placesHeldByLeavers: heldByLeavers,
    classesArchived,
    liveClasses: liveClasses.map((c) => ({
      courseName: c.product.name,
      pupils: c.pupils.map((p) => ({ startedAt: p.progress.map((r) => r.updatedAt) })),
    })),
  });
}
