/**
 * Which school a person is looking at, when they belong to more than one.
 *
 * THE BUG THIS EXISTS TO END. `getSchoolContext` asked Postgres for the
 * caller's membership with `findFirst` and no `orderBy`, so when somebody
 * belonged to two schools the database handed back whichever row it liked.
 * The owner onboarded a school called "school test one", opened the portal,
 * and was shown a trial-ended screen for Robocode: a different school, from
 * an earlier test, whose trial had run out a fortnight before. Nothing was
 * broken in the new school. The portal was simply looking at the wrong one,
 * and because that one was dead, every screen was blocked.
 *
 * A teacher really can work at two schools, so the answer is not to forbid
 * it. The answer is to choose well and let them say otherwise.
 *
 * Kept free of Prisma so the choice can be tested on its own, which matters:
 * this is the kind of rule that looks obvious and goes wrong at the edges,
 * and the edges here are all "the first one is dead".
 */
export interface SchoolChoice {
  orgId: string;
  name: string;
  /** False once the trial has run out or staff have closed the account. */
  live: boolean;
}

/**
 * The school to show, from the ones this person belongs to.
 *
 * `schools` arrives newest membership first, which is the order that matches
 * what somebody just did: the school you joined last is the one you are
 * most likely looking for.
 *
 * 1. The one they picked, if they picked one and are still in it.
 * 2. Otherwise the newest LIVE one, because a dead school blocks every
 *    screen behind a trial-ended or access-closed notice, and showing that
 *    to somebody who also belongs to a working school is simply wrong.
 * 3. Otherwise the newest, so a person whose only school has lapsed still
 *    sees that school and the notice explaining it.
 */
export function pickSchool(
  schools: readonly SchoolChoice[],
  preferredOrgId?: string | null,
): SchoolChoice | null {
  if (schools.length === 0) return null;
  if (preferredOrgId) {
    const asked = schools.find((s) => s.orgId === preferredOrgId);
    /* Only ever a choice BETWEEN schools they belong to, so a forged
       preference buys nothing: it either names one of their own or is
       ignored. */
    if (asked) return asked;
  }
  return schools.find((s) => s.live) ?? schools[0];
}

/** The cookie that remembers the choice. */
export const SCHOOL_CHOICE_COOKIE = "ax_school";
