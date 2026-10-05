import Stripe from "stripe";
import type { OrgPlan } from "@prisma/client";
import { CORPORATE_PRODUCT_SLUGS, COURSE_NAME, VAT_PERCENT, type CorporateProductSlug } from "@/app/lib/corporateProducts";

export { COURSE_NAME, VAT_PERCENT };

/* Stripe for the corporate packs. Everything is driven by environment
 * variables so checkout switches on the moment they exist on Vercel and
 * stays off, with a plain message, until then. Never import from a
 * client component. */

export const SEAT_MIN = 10;
export const SEAT_MAX = 249;
export const SEAT_STEP = 10;

/* The published prices, pence per seat per year (owner-set 2026-09-29).
 * Shown to the buyer before checkout; Stripe's price objects must match. */
export const SEAT_PRICE_PENCE: Record<CorporateProductSlug, Record<"TEAM" | "FIRM", number>> = {
  "ai-cleared": { TEAM: 2900, FIRM: 2500 },
  "ai-fluent": { TEAM: 5900, FIRM: 4500 },
};


export function planForSeats(seats: number): OrgPlan {
  if (seats >= 250) return "ENTERPRISE";
  if (seats >= 50) return "FIRM";
  return "TEAM";
}

function priceEnv(course: CorporateProductSlug, plan: "TEAM" | "FIRM"): string | undefined {
  const key = `STRIPE_PRICE_${course.toUpperCase().replace(/-/g, "_")}_${plan}`;
  return process.env[key];
}

/* Which courses can be bought by card: the ones whose two Stripe prices
 * are set. AI Fluent joins the buy page the moment its prices exist. */
export function sellableCourses(): CorporateProductSlug[] {
  return CORPORATE_PRODUCT_SLUGS.filter((c) => priceEnv(c, "TEAM") && priceEnv(c, "FIRM"));
}

/* Checkout is live when the secret key, the webhook secret and AI
 * Cleared's two prices are present. */
export function stripeConfigured(): boolean {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return false;
  return sellableCourses().includes("ai-cleared");
}

export function priceIdFor(course: CorporateProductSlug, plan: OrgPlan): string | null {
  if (plan === "ENTERPRISE") return null;
  return priceEnv(course, plan) ?? null;
}

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/* The fixed UK VAT rate, found or created once per instance in whichever
 * Stripe account the key belongs to (the sandbox and the live account
 * each get their own), so nobody makes it by hand or carries its id in a
 * variable. Tagged in metadata so a later rate change makes a new one
 * rather than editing history. */
let vatRateId: string | null = null;
export async function vatTaxRateId(): Promise<string> {
  if (vatRateId) return vatRateId;
  const s = stripe();
  const tag = `uk-vat-${VAT_PERCENT}`;
  const existing = await s.taxRates.list({ active: true, limit: 100 });
  const found = existing.data.find((r) => r.metadata?.algorithmx === tag);
  const rate =
    found ??
    (await s.taxRates.create({
      display_name: "VAT",
      percentage: VAT_PERCENT,
      inclusive: false,
      country: "GB",
      tax_type: "vat",
      jurisdiction: "GB",
      description: `UK VAT at ${VAT_PERCENT}%`,
      metadata: { algorithmx: tag },
    }));
  vatRateId = rate.id;
  return rate.id;
}
