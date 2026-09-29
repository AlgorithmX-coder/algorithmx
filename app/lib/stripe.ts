import Stripe from "stripe";
import type { OrgPlan } from "@prisma/client";
import type { CorporateProductSlug } from "@/app/lib/corporateProducts";

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

export const COURSE_NAME: Record<CorporateProductSlug, string> = { "ai-cleared": "AI Cleared", "ai-fluent": "AI Fluent" };

/* Which courses can be bought by card today. AI Fluent joins when built. */
export const SELLABLE: CorporateProductSlug[] = ["ai-cleared"];

export function planForSeats(seats: number): OrgPlan {
  if (seats >= 250) return "ENTERPRISE";
  if (seats >= 50) return "FIRM";
  return "TEAM";
}

function priceEnv(course: CorporateProductSlug, plan: "TEAM" | "FIRM"): string | undefined {
  const key = `STRIPE_PRICE_${course.toUpperCase().replace(/-/g, "_")}_${plan}`;
  return process.env[key];
}

/* Checkout is live when the secret key, the webhook secret and every
 * sellable course's two prices are present. */
export function stripeConfigured(): boolean {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return false;
  return SELLABLE.every((c) => priceEnv(c, "TEAM") && priceEnv(c, "FIRM"));
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
