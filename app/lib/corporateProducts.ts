/* Corporate (B2B) products are seat-licensed by a firm and never sold on
 * the consumer hub, so the hub and the age-track pages exclude them by
 * slug. Keep this list in step with prisma/seed.ts. */
export const CORPORATE_PRODUCT_SLUGS = ["ai-cleared", "ai-fluent"] as const;
export type CorporateProductSlug = (typeof CORPORATE_PRODUCT_SLUGS)[number];

/* UK VAT, added on top of every published seat price at checkout. Shared
 * with the client so the buy page shows the same sum Stripe charges. */
export const VAT_PERCENT = 20;
