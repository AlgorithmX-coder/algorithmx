/**
 * Course-intent plumbing shared by /signup, /login and /hub.
 *
 * A user can arrive at signup or login from a specific course card
 * (e.g. /signup?course=cyber-heroes). We carry that slug through the
 * auth flow to /hub?selected=<slug> so the hub can highlight the
 * matching ProductCard.
 *
 * All three routes MUST agree on (a) what a valid slug looks like and
 * (b) how the hub URL is built — if they drift, the highlight silently
 * stops firing. Keeping both in one module makes that invariant local.
 */

/* Catalog slugs are lowercase kebab-case (cyber-heroes, cyberstart-pro).
 * Anchored + length-capped so the value is safe to round-trip through a
 * callbackUrl and a query string. */
const COURSE_SLUG_RE = /^[a-z0-9-]{1,40}$/;

/** Returns the slug when it has a safe catalog-slug shape, else null. */
export function safeCourseSlug(raw: string | null | undefined): string | null {
  return raw && COURSE_SLUG_RE.test(raw) ? raw : null;
}

/* Courses that own a dedicated home to land on after auth, instead of the
 * family hub. Cyber Pro drops the learner straight onto its module page. */
const COURSE_HOME: Record<string, string> = {
  "cyberstart-pro": "/pro/course",
};

/**
 * The post-auth destination for a course. A course with its own home (see
 * COURSE_HOME) goes straight there; otherwise the family hub, optionally
 * pre-selecting the course. Pass the result of {@link safeCourseSlug}.
 */
export function hubTargetFor(slug: string | null): string {
  if (slug && COURSE_HOME[slug]) return COURSE_HOME[slug];
  return slug ? `/hub?selected=${slug}` : "/hub";
}
