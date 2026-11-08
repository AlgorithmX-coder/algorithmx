/**
 * What a trial is, in one place, so staff and the school are never told two
 * different things.
 *
 * A trial is NOT a small licence. It is a time-boxed look at the product with
 * enough places to run a real class, because a school cannot judge any of
 * this without getting children through a lesson. Both numbers below used to
 * be invisible: the places were a literal `30` buried in the admin panel's
 * fetch call, which is why a trial school was told "30 places are ready" by
 * an email when nobody had chosen 30, or anything at all.
 *
 * No Prisma import: this is read by the staff form (a client component) as
 * well as by the server.
 */

/** Lengths staff can pick, in days. A day or two never let a school get a
 *  class through a lesson, let alone show it to anyone else. */
export const TRIAL_LENGTHS = [1, 3, 7, 14, 30] as const;

/** A week. Long enough to cover a timetabled lesson and talk about it. */
export const DEFAULT_TRIAL_DAYS = 7;

/** Places a trial school gets to try with. Enough for one real class. It is
 *  an allowance, never a purchase, and no email ever calls it one. */
export const DEFAULT_TRIAL_PLACES = 30;
