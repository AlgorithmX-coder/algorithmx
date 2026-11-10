import Stripe from "stripe";
import type { OrgPlan } from "@prisma/client";
import { COURSE_NAME, VAT_PERCENT, type VatMode } from "@/app/lib/corporateProducts";

export { COURSE_NAME, VAT_PERCENT };

/* VAT_MODE on Vercel; the older STRIPE_AUTOMATIC_TAX=1 still means automatic. */
export function vatMode(): VatMode {
  const m = (process.env.VAT_MODE ?? "").trim().toLowerCase();
  if (m === "automatic" || m === "none" || m === "fixed") return m;
  return process.env.STRIPE_AUTOMATIC_TAX === "1" ? "automatic" : "fixed";
}

/* The percentage the buy page adds to the published price: the fixed
 * rate, or nothing when Stripe works it out or there is none. */
export function vatPercentShown(): number {
  return vatMode() === "fixed" ? VAT_PERCENT : 0;
}

/* Stripe for the firm lane. Checkout switches on the moment the key and
 * the webhook secret exist on Vercel and stays off, with a plain message,
 * until then. Never import from a client component.
 *
 * There are no Stripe Price objects to keep in step any more: Cyber
 * Secured is charged with an inline price worked out in
 * cyberSecuredPricing.ts, so the STRIPE_PRICE_AI_* variables are no longer
 * read and can be deleted from Vercel at leisure. */

export function planForSeats(seats: number): OrgPlan {
  if (seats >= 250) return "ENTERPRISE";
  if (seats >= 50) return "FIRM";
  return "TEAM";
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
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
