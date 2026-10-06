/* Corporate (B2B) products are seat-licensed by a firm and never sold on
 * the consumer hub, so the hub and the age-track pages exclude them by
 * slug. Keep this list in step with prisma/seed.ts. */
export const CORPORATE_PRODUCT_SLUGS = ["ai-cleared", "ai-fluent"] as const;
export type CorporateProductSlug = (typeof CORPORATE_PRODUCT_SLUGS)[number];

export const COURSE_NAME: Record<CorporateProductSlug, string> = { "ai-cleared": "AI Cleared", "ai-fluent": "AI Fluent" };

/* What the buyer is choosing between, in the words of the corporate page. */
/* Why a firm cannot start with AI Fluent: a Fluent seat is claimed by a
 * person holding a valid AI Cleared certificate, so a firm with no Cleared
 * seats would have nobody who could sit it. Shown on the buy form and
 * returned by the checkout route. */
export const FLUENT_NEEDS_CLEARED_FIRM = "AI Fluent seats are added to a firm that already runs AI Cleared. Buy AI Cleared first, or use the admin email of your existing firm.";

export const COURSE_BLURB: Record<CorporateProductSlug, string> = {
  "ai-cleared": "The safety gate every member of staff passes. About 90 minutes, in 20 minute sittings.",
  "ai-fluent": "The upskill for staff who hold an AI Cleared certificate. About 3 hours, in 20 minute sittings.",
};

/* UK VAT, added on top of every published seat price at checkout when
 * the firm is VAT registered. Shared with the client so the buy page
 * shows the same sum Stripe charges. */
export const VAT_PERCENT = 20;

/* How VAT is handled at checkout, from VAT_MODE on Vercel:
 *  fixed      the UK rate above on every line (the default)
 *  automatic  Stripe Tax works it out from the billing address
 *  none       no VAT at all, until AlgorithmX is VAT registered
 * The buy page and the checkout read the same setting. */
export type VatMode = "fixed" | "automatic" | "none";

/* What the buyer sees on the page for each setting. */
export const VAT_LINE: Record<VatMode, string> = {
  fixed: `VAT at ${VAT_PERCENT}% is added at checkout and shown on your invoice.`,
  automatic: "VAT is worked out from your billing address at checkout and shown on your invoice.",
  none: "Prices are not subject to VAT.",
};
