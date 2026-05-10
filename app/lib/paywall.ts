/**
 * Single source of truth for "does this user have lesson access?"
 *
 * DEFAULT: paywall is OFF. Anyone signed in can access every lesson.
 *
 * Pre-launch (right now): no env var needed. The product is in
 * content-development mode; we want the team + invited testers to
 * walk straight into Week 1 without setting up Stripe.
 *
 * For launch: set `PAYWALL_ENFORCED=true` on Vercel (Production scope).
 * The gate snaps back on. Only users with `stripeStatus === 'active'`
 * or `'paid'` get past `/lesson`. Anyone else gets bounced to the
 * dashboard upsell card.
 *
 * Call this helper from every server component or API route that
 * needs to gate against payment. Do NOT inline the stripeStatus
 * check. Keeping the logic in one file means flipping a single env
 * var closes the gate everywhere.
 */
export function hasLessonAccess(user: {
  stripeStatus?: string | null;
} | null | undefined): boolean {
  // Default: paywall is OFF. Only enforce when the env var is set.
  if (process.env.PAYWALL_ENFORCED !== "true") return true;

  // Stripe payment recorded. The only way past the gate when
  // enforcement is on.
  return (
    user?.stripeStatus === "active" || user?.stripeStatus === "paid"
  );
}

/**
 * Is the paywall currently being enforced? Used by the dashboard to
 * show or hide the £99 upsell card. When the gate is off the upsell
 * shouldn't appear. It would be incoherent to show "Buy now" and then
 * let the parent walk into a free lesson.
 */
export function isPaywallEnforced(): boolean {
  return process.env.PAYWALL_ENFORCED === "true";
}
