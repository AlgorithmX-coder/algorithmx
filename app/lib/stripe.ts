import Stripe from "stripe";

/**
 * Server-side Stripe SDK singleton.
 *
 * Pinned to API version `2026-04-22.dahlia` (latest at time of writing).
 * Ref: stripe-best-practices skill, SKILL.md.
 *
 * Only ever import this from server code (`route.ts`, server actions,
 * `auth.ts` callbacks).  The secret key MUST NOT reach the browser.
 * The client-side SDK lives in `@stripe/stripe-js` and uses the
 * publishable key - keep them in separate files so a client component
 * can never accidentally pull in this module.
 */

const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

function getStripe(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set.  Add it to .env.local (test mode) " +
        "or your hosting provider's secret store (production).",
    );
  }

  const client = new Stripe(key, {
    // Pinned to latest stable.  The `as never` cast bypasses stripe-node's
    // strict literal-union apiVersion type, which lags behind the current
    // API version surface and would otherwise reject this string at compile
    // time even when the SDK runtime accepts it.
    apiVersion: "2026-04-22.dahlia" as unknown as never,
    typescript: true,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.stripe = client;
  }
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/* ─── Pricing ──────────────────────────────────────────────────────── */
// One-time £99 GBP charge for "Cyber Heroes Academy - Lifetime Access".
// Inline price_data is fine for this MVP.  When we move to multiple
// SKUs (other courses), promote these into Stripe Products + Prices and
// reference them by `price` ID in the Checkout Session.
export const CYBER_HEROES_PRICE_GBP = 9900; // pence

export const CYBER_HEROES_PRODUCT_NAME = "Cyber Heroes Academy";
export const CYBER_HEROES_PRODUCT_DESC =
  "Lifetime access to the 20-week Cyber Heroes Academy - animated cybersecurity missions for ages 6–10.";
