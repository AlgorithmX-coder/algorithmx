/**
 * What one person pays for one workplace course (AI Cleared, AI Fluent,
 * Cyber Awareness) bought for themselves, in pence, VAT included. A one-off
 * payment for that one course. Owner, 2026-11-26: 29 pounds.
 *
 * The one place this figure lives. The course sign-in and sign-up doors
 * show it; the consumer checkout (held PR, consumerCatalogue.ts) should
 * charge it from here too, so the page and the charge never drift apart.
 *
 * Firms buy these courses per seat instead (cyberSecuredPricing.ts); this
 * figure has nothing to do with seat pricing.
 *
 * Client-safe: no Prisma, no Stripe.
 */
export const INDIVIDUAL_WORKPLACE_COURSE_PENCE = 2900;

/** The catalog slugs this price applies to. */
export const INDIVIDUAL_WORKPLACE_COURSE_SLUGS = ["ai-cleared", "ai-fluent", "cyber-awareness"] as const;

/** Whole pounds without pence ("29"), anything else with ("29.50"). No currency sign: the doors set the pound sign apart. */
export function poundsFigure(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? String(pounds) : pounds.toFixed(2);
}
