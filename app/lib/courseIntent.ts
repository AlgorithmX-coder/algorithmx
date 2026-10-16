/**
 * Course-intent plumbing shared by /signup and /login.
 *
 * A user can arrive at signup or login from a specific course card
 * (e.g. /signup?course=cyber-heroes), and each cyber course now has its
 * own themed login and signup page. We carry that slug through the auth
 * flow so the learner lands INSIDE the course they signed in to.
 *
 * There is no family hub any more (owner 2026-10-16: "I want to
 * completely decommission the hub... as soon as you log in, you go
 * straight to the inside portal"). A sign-in with no course context has
 * nowhere course-specific to go, so it falls back to the catalogue,
 * which shows what the account owns and what it does not.
 *
 * Login, signup and every entitlement gate MUST agree on these
 * destinations - if they drift, a learner gets bounced between two
 * routes. Keeping them in one module makes that invariant local.
 */

/* Catalog slugs are lowercase kebab-case (cyber-heroes, cyberstart-pro).
 * Anchored + length-capped so the value is safe to round-trip through a
 * callbackUrl and a query string. */
const COURSE_SLUG_RE = /^[a-z0-9-]{1,40}$/;

/** Returns the slug when it has a safe catalog-slug shape, else null. */
export function safeCourseSlug(raw: string | null | undefined): string | null {
  return raw && COURSE_SLUG_RE.test(raw) ? raw : null;
}

/**
 * Where a signed-in learner goes when they do not own what they asked
 * for, or when nothing said which course they came from. The catalogue
 * lists every course with its own state, so it can route them onwards.
 */
export const CATALOGUE = "/cybersecurity";

/* Every course lands the learner STRAIGHT in its own portal. Each
 * destination runs its own entitlement and onboarding guards, so an
 * un-set-up account is redirected from there rather than parked. */
const COURSE_HOME: Record<string, string> = {
  "cyber-heroes": "/dashboard",
  cyberexplorers: "/explorers",
  cyberstart: "/operators/portfolio",
  "cyberstart-pro": "/pro/course",
};

/**
 * The post-auth destination for a course. A known course goes straight to
 * its own portal; anything else goes to the catalogue. Pass the result of
 * {@link safeCourseSlug}.
 */
export function courseHomeFor(slug: string | null): string {
  if (slug && COURSE_HOME[slug]) return COURSE_HOME[slug];
  return CATALOGUE;
}
