/**
 * The data-retention policy, as numbers and pure decisions.
 *
 * Owner-approved 2026-11-26:
 *   - individual accounts: deleted 2 years after last sign-in, with a
 *     warning email 30 days before;
 *   - school pupils: deleted at licence end + 90 days;
 *   - firm learners: deleted at licence end + 90 days;
 *   - payment and invoice records: kept 6 years;
 *   - enquiry-form leads: 2 years;
 *   - AI usage rows (ModelCall) and similar logs: 90 days.
 *
 * No database in here, so each rule can be stated in a test in plain terms.
 * app/lib/retention.ts gathers the rows and asks these functions.
 */

export const RETENTION = {
  individualInactiveDays: 730,
  individualWarnDaysBefore: 30,
  pupilGraceDays: 90,
  learnerGraceDays: 90,
  paymentDays: 6 * 365 + 2,
  enquiryDays: 730,
  logDays: 90,
} as const;

/**
 * The day the sign-in clock starts for accounts that have never had a
 * sign-in recorded. `User.lastSignInAt` did not exist before this date, so
 * an account last seen before it would otherwise look as old as the day it
 * was made. Counting those accounts from here instead means nobody is
 * warned, let alone deleted, on a guess.
 */
export const SIGN_IN_CLOCK_START = new Date("2026-11-26T00:00:00Z");

const DAY = 86_400_000;

export function daysBefore(now: Date, days: number): Date {
  return new Date(now.getTime() - days * DAY);
}

/** When this person was last seen: their last recorded sign-in, or, for an
 *  account with none, the later of when it was made and the clock start. */
export function lastSeen(u: { lastSignInAt: Date | null; createdAt: Date }): Date {
  if (u.lastSignInAt) return u.lastSignInAt;
  return u.createdAt > SIGN_IN_CLOCK_START ? u.createdAt : SIGN_IN_CLOCK_START;
}

export type IndividualVerdict =
  /** Signed in recently enough. */
  | "keep"
  /** Inside the last 30 days before deletion and not yet warned. */
  | "warn"
  /** Warned, a full 30 days ago, and not signed in since. */
  | "delete"
  /** Due, but holds a purchase young enough to be a payment record. */
  | "hold_payment";

/**
 * One individual account, against the two-year rule.
 *
 * Deletion needs a warning first, sent at least 30 days earlier and not
 * answered by a sign-in. That holds even for an account already past two
 * years: it is warned now and deleted 30 days later, never deleted cold.
 */
export function individualVerdict(
  u: {
    lastSignInAt: Date | null;
    createdAt: Date;
    retentionWarnedAt: Date | null;
    /** When each course they BOUGHT was granted. */
    purchasedAt: readonly Date[];
  },
  now: Date,
): IndividualVerdict {
  const seen = lastSeen(u);
  const warnFrom = daysBefore(now, RETENTION.individualInactiveDays - RETENTION.individualWarnDaysBefore);
  if (seen >= warnFrom) return "keep";

  const warnedSinceSeen = u.retentionWarnedAt !== null && u.retentionWarnedAt > seen;
  if (!warnedSinceSeen) return "warn";

  const deleteFrom = daysBefore(now, RETENTION.individualInactiveDays);
  const warnedLongEnough = u.retentionWarnedAt! <= daysBefore(now, RETENTION.individualWarnDaysBefore);
  if (seen >= deleteFrom || !warnedLongEnough) return "keep";

  const paymentFrom = daysBefore(now, RETENTION.paymentDays);
  if (u.purchasedAt.some((d) => d > paymentFrom)) return "hold_payment";
  return "delete";
}

/**
 * When an organisation's licence ended, or null while it runs.
 *
 * There is no licence end date in the schema. The two facts that ARE stored
 * stand in for it: staff closing access (`revokedAt`), and a staff trial
 * that ran out without being converted (`trialExpiresAt` in the past; it is
 * cleared to null when a trial becomes a licence). A paid licence that has
 * simply lapsed, with nobody closing it, cannot be seen at all.
 */
export function licenceEndedAt(
  org: { revokedAt: Date | null; trialExpiresAt: Date | null },
  now: Date,
): Date | null {
  const ends: Date[] = [];
  if (org.revokedAt) ends.push(org.revokedAt);
  if (org.trialExpiresAt && org.trialExpiresAt <= now) ends.push(org.trialExpiresAt);
  if (ends.length === 0) return null;
  return ends.reduce((a, b) => (a < b ? a : b));
}

/** True once a licence ended more than `graceDays` ago. */
export function pastGrace(
  org: { revokedAt: Date | null; trialExpiresAt: Date | null },
  graceDays: number,
  now: Date,
): boolean {
  const ended = licenceEndedAt(org, now);
  return ended !== null && ended <= daysBefore(now, graceDays);
}
