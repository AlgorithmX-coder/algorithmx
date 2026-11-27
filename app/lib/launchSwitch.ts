/**
 * THE LAUNCH SWITCH. One constant for the whole tester period.
 *
 * Flip to false at launch: turns off free signup grants AND the gate's
 * tester grant.
 *
 * While it is true (owner: testers stay fully open until launch):
 *   - /api/signup grants the course a person signed up through
 *     (FREE_ON_SIGNUP in app/api/signup/route.ts);
 *   - requireCourse (app/lib/courseAccess.ts) grants a signed-in adult the
 *     course they opened when they do not hold it yet, then lets them in,
 *     so tester accounts made before a course joined FREE_ON_SIGNUP are not
 *     locked out. School pupils are never auto-granted.
 *
 * Once false, buying (or an organisation's licence, or a staff grant) is the
 * only way into a course.
 */
export const TESTER_FREE_ACCESS: boolean = true;

/**
 * THE CHECKOUT SWITCH. Whether the public can buy a course for themselves.
 *
 * While false, /purchase/<slug> tells everyone "Buying opens soon" and
 * creates nothing, EXCEPT staff (isStaffUser), who get the real Stripe
 * checkout so the owner can try it end to end on the sandbox keys. The
 * landing pages keep their sign-up buttons while it is false.
 *
 * Flip to true at launch, in the same change that sets TESTER_FREE_ACCESS
 * to false: the landing buttons then go to /purchase/<slug>, and a
 * signed-in adult who opens a course they do not hold is sent there too.
 *
 * Client-safe: plain constants, no imports.
 */
export const CONSUMER_CHECKOUT_OPEN: boolean = false;
