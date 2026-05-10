/**
 * Single source of truth for "does this user have lesson access?"
 *
 * Three gates land you on `hasLessonAccess = true`:
 *
 *   1. Server-side env override: `PAYWALL_DISABLED=true` set on Vercel
 *      (Production / Preview / Development scope, your choice).
 *      Use this during testing + content development. UNSET BEFORE LAUNCH.
 *
 *   2. Local dev shortcut: NODE_ENV !== 'production' AND
 *      DEV_BYPASS_PAYWALL=true in .env.local. Belt-and-braces for local
 *      work; the env var alone in (1) also satisfies this case.
 *
 *   3. The user has a successful Stripe payment recorded —
 *      stripeStatus === 'active' or 'paid'.
 *
 * Call this helper from every server component or API route that needs
 * to gate against payment. Do NOT inline the stripeStatus check —
 * keeping the env-var bypass logic in one file means you flip a single
 * flag to open / close the gate everywhere.
 */
export function hasLessonAccess(user: {
  stripeStatus?: string | null;
} | null | undefined): boolean {
  // Env override - works in prod too. Set PAYWALL_DISABLED=true on
  // Vercel to unlock all lessons without payment. UNSET BEFORE LAUNCH.
  if (process.env.PAYWALL_DISABLED === "true") return true;

  // Legacy local-dev shortcut. Kept so .env.local files from earlier in
  // the project still work.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_PAYWALL === "true"
  ) {
    return true;
  }

  // Stripe payment recorded.
  return (
    user?.stripeStatus === "active" || user?.stripeStatus === "paid"
  );
}

/**
 * Convenience: is the paywall currently bypassed by env (any scope)?
 * Used by the dashboard to hide the £99 upsell card when the gate is
 * open so the parent doesn't see "Buy now" but then walk into a free
 * lesson - the UI would be incoherent.
 */
export function isPaywallBypassed(): boolean {
  if (process.env.PAYWALL_DISABLED === "true") return true;
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_PAYWALL === "true"
  ) {
    return true;
  }
  return false;
}
