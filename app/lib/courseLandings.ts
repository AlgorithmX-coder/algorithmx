/**
 * Slug → marketing-landing-route map for every Product that has a
 * publicly browsable landing page.
 *
 * Owned by the hub + the ProductCard component: any product whose
 * slug appears here gets a "View course →" link, any product whose
 * slug doesn't gets only its primary CTA (Enter / Purchase /
 * waitlist). The five non-Cyber COMING_SOON streams have no entries
 * yet and therefore no link, which is the desired behaviour.
 *
 * Add a new entry the moment a new track lands a marketing page —
 * the hub will surface the link without further changes.
 */
export const COURSE_LANDING_ROUTES: Readonly<Record<string, string>> = {
  "cyber-heroes": "/cyberheroes",
  "cyberexplorers": "/cyberexplorers",
  "cyberstart": "/ops",
  "cyberstart-pro": "/pro",
  "desk-ready": "/desk-ready",
};

/** Returns the landing route for a product slug, or null if none. */
export function landingRouteFor(slug: string): string | null {
  return COURSE_LANDING_ROUTES[slug] ?? null;
}

/**
 * Where signing out of a course lands you.
 *
 * Owner, 2026-10-16: a parent signing out of their child's course wants that
 * course in front of them, with its own log-in on it, not the top of a
 * multi-product company site they then have to navigate back down.
 *
 * A SCHOOL PUPIL is the case that decision did not have to cover, because
 * pupils could not sign out at all. Sending one to the Cyber Heroes sales
 * page puts a marketing page with a parent's log-in on it in front of a
 * child on a classroom machine, with their own way back in nowhere on it.
 * They go to the school door, which is where whoever is next comes through.
 *
 * A function rather than two expressions inlined at each call site, because
 * the rule was previously guarded by a test that grepped the source of both
 * pages for the string "landingRouteFor". That guard protected the decision
 * right up until the decision grew a second case, and then failed on a
 * change that honoured it. Behaviour is the thing worth testing.
 */
export function logoutDestinationFor(args: { slug: string; pupil?: boolean }): string {
  if (args.pupil) return "/schools/login";
  return landingRouteFor(args.slug) ?? "/";
}
