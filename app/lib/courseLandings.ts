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
  "cyberstart-pro": "/cyberstart-pro",
};

/** Returns the landing route for a product slug, or null if none. */
export function landingRouteFor(slug: string): string | null {
  return COURSE_LANDING_ROUTES[slug] ?? null;
}
