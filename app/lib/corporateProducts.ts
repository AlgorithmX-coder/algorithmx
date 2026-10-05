/* Corporate (B2B) products are seat-licensed by a firm and never sold on
 * the consumer hub, so the hub and the age-track pages exclude them by
 * slug. Keep this list in step with prisma/seed.ts. */
export const CORPORATE_PRODUCT_SLUGS = ["ai-cleared", "ai-fluent"] as const;
export type CorporateProductSlug = (typeof CORPORATE_PRODUCT_SLUGS)[number];

export const COURSE_NAME: Record<CorporateProductSlug, string> = { "ai-cleared": "AI Cleared", "ai-fluent": "AI Fluent" };

/* What the buyer is choosing between, in the words of the corporate page. */
export const COURSE_BLURB: Record<CorporateProductSlug, string> = {
  "ai-cleared": "The safety gate every member of staff passes. About 90 minutes, in 20 minute sittings.",
  "ai-fluent": "The upskill for staff who hold an AI Cleared certificate. About 3 hours, in 20 minute sittings.",
};

/* UK VAT, added on top of every published seat price at checkout. Shared
 * with the client so the buy page shows the same sum Stripe charges. */
export const VAT_PERCENT = 20;
